import logger from "./logger";
import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";
import http from "http";
import https from "https";

interface ShutdownOptions {
  server?: http.Server | https.Server;
  prisma?: PrismaClient;
  redis?: ReturnType<typeof createClient>;
  exitCode?: number;
  timeout?: number;
}

export const shutdownHandler = async ({
  server,
  prisma,
  redis,
  exitCode = 0,
  timeout = 10000,
}: ShutdownOptions) => {
  logger.info("Starting graceful shutdown...");

  const shutdownActions = [
    // Close HTTP server if exists
    server
      ? () =>
          new Promise<void>((resolve) => {
            server.close((err) => {
              if (err) {
                logger.error("Error closing server", err);
              } else {
                logger.info("HTTP server closed");
              }
              resolve();
            });
          })
      : null,

    // Disconnect Prisma if exists
    prisma
      ? () =>
          prisma
            .$disconnect()
            .then(() => logger.info("Prisma disconnected"))
            .catch((err) => logger.error("Error disconnecting Prisma", err))
      : null,

    // Disconnect Redis if exists
    redis
      ? () =>
          redis
            .quit()
            .then(() => logger.info("Redis disconnected"))
            .catch((err) => logger.error("Error disconnecting Redis", err))
      : null,
  ].filter(Boolean) as Array<() => Promise<void>>;

  try {
    // Execute shutdown actions with timeout
    await Promise.race([
      Promise.all(shutdownActions.map((action) => action())),
      new Promise<void>((_, reject) =>
        setTimeout(() => {
          reject(new Error("Shutdown timed out"));
        }, timeout)
      ),
    ]);

    logger.info("Graceful shutdown completed");
    process.exit(exitCode);
  } catch (error) {
    logger.error("Graceful shutdown failed:", error);
    process.exit(1);
  }
};

// Setup signal handlers
export const setupSignalHandlers = (
  options: Omit<ShutdownOptions, "exitCode" | "timeout">
) => {
  const signals: NodeJS.Signals[] = ["SIGINT", "SIGTERM", "SIGHUP"];

  signals.forEach((signal) => {
    process.on(signal, () => {
      logger.warn(`Received ${signal}, starting shutdown...`);
      shutdownHandler({ ...options, exitCode: 0 });
    });
  });

  // Prevent unhandled promise rejections from crashing the process
  process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at:", promise, "reason:", reason);
    // Optionally: shutdownHandler({ ...options, exitCode: 1 });
  });

  // Handle uncaught exceptions
  process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception:", error);
    shutdownHandler({ ...options, exitCode: 1 });
  });
};
