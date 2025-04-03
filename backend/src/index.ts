import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import { createClient } from "redis";
import { PrismaClient } from "@prisma/client";
import http from "http";
import https from "https";
import fs from "fs";
import path from "path";

// Import your existing modules
import { errorHandler, AppError } from "./middlewares/errorHandler";
import logger from "./utils/logger";
import { HealthService } from "./services/healthCheck";
import { shutdownHandler, setupSignalHandlers } from "./utils/shutdownHandler";

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ["PORT", "DATABASE_URL", "JWT_SECRET"];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`Environment variable ${envVar} is required`);
  }
});

// Initialize Express app
const app: Application = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === "production";

// Initialize Prisma client with connection pool settings
export const prisma = new PrismaClient({
  log: isProduction ? ["error", "warn"] : ["query", "info", "warn", "error"],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

// Initialize Redis client with proper configuration
export const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 100, 5000),
    tls: process.env.REDIS_TLS === "true",
  },
  ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
});

// Initialize HealthService
const healthService = new HealthService(prisma, redisClient);

// Redis connection management
const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    logger.info("Connected to Redis successfully");

    // Regular health checks using the HealthService
    setInterval(async () => {
      try {
        await healthService.checkRedis();
      } catch (error) {
        logger.error("Redis health check failed", error);
      }
    }, 30000);
  } catch (error) {
    logger.error("Redis connection error:", error);
    // Exponential backoff for reconnection
    setTimeout(connectRedis, 5000);
  }
};

// Middleware setup
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(
  cors({
    origin: process.env.CORS_ORIGINS?.split(",") || "*",
    credentials: true,
  })
);
app.use(helmet());
app.use(
  morgan(isProduction ? "combined" : "dev", {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  })
);

// Rate limiting
const limiter = rateLimit({
  windowMs: (Number(process.env.RATE_LIMIT_WINDOW) || 15) * 60 * 1000,
  max: Number(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    throw new AppError("Too many requests, please try again later", 429);
  },
});
app.use(limiter);

// Health check endpoint using HealthService
app.get("/health", async (req: Request, res: Response) => {
  try {
    const healthStatus = await healthService.getHealthStatus();
    res.status(healthStatus.status === "UP" ? 200 : 503).json(healthStatus);
  } catch (error) {
    logger.error("Health check failed", error);
    res.status(500).json({ status: "DOWN", error: "Health check failed" });
  }
});

// API routes would be mounted here
// app.use('/api/v1/users', userRoutes);

// 404 Handler
app.use((req, res) => {
  throw new AppError("Resource not found", 404);
});

// Error Handler
app.use(errorHandler);

// Database and server startup
const startServer = async (): Promise<void> => {
  try {
    // Test database connection
    await prisma.$connect();
    logger.info("Connected to PostgreSQL database");

    // Connect to Redis
    await connectRedis();

    // Create HTTP/HTTPS server based on environment
    let server;
    if (isProduction) {
      const sslOptions = {
        key: fs.readFileSync(path.join(__dirname, "../ssl/server.key")),
        cert: fs.readFileSync(path.join(__dirname, "../ssl/server.crt")),
      };
      server = https.createServer(sslOptions, app);
    } else {
      server = http.createServer(app);
    }

    server.listen(PORT, () => {
      logger.info(
        `Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
      );
    });

    // Setup graceful shutdown and signal handlers
    setupSignalHandlers({ server, prisma, redis: redisClient });
  } catch (error) {
    logger.error("Server startup failed:", error);
    process.exit(1);
  }
};

// Start the server
startServer();
