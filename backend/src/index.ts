import express, { Application } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { rateLimit } from "express-rate-limit";
import { createClient } from "redis";
import { PrismaClient } from "@prisma/client";

import { errorHandler } from "./middlewares/errorHandler";

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Application = express();
const PORT = process.env.PORT || 3000;

// Initialize Prisma client
export const prisma = new PrismaClient();

// Initialize Redis client
export const redisClient = createClient({
  url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`,
});

// Connect to Redis
const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log("Connected to Redis successfully");
  } catch (error) {
    console.error("Redis connection error:", error);
    // Retry connection after 5 seconds
    setTimeout(connectRedis, 5000);
  }
};

connectRedis();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Routes

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ message: "Resource not found" });
});

// Error Handler
app.use(errorHandler);

// Start the server
const startServer = async () => {
  try {
    await prisma.$connect();
    console.log("Connected to PostgreSQL database");

    app.listen(PORT, () => {
      console.log(
        `Server running on port ${PORT} in ${process.env.NODE_ENV} mode`
      );
    });
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err);
  process.exit(1);
});

// Start the server
startServer();
