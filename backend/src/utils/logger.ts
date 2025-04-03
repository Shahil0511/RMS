import winston from "winston";
import { TransformableInfo } from "logform";
import DailyRotateFile from "winston-daily-rotate-file";
import { Request, Response } from "express";

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf((info: TransformableInfo) => {
  const { timestamp, level, message, stack, ...meta } = info;
  let log = `${timestamp} [${level.toUpperCase()}] ${message}`;

  if (stack) {
    log += `\n${stack}`;
  }

  if (Object.keys(meta).length > 0) {
    log += `\n${JSON.stringify(meta, null, 2)}`;
  }

  return log;
});

// Log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Determine log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || "development";
  return env === "development" ? "debug" : "info";
};

// Create logger instance
const logger = winston.createLogger({
  level: level(),
  levels,
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: combine(colorize(), logFormat),
    }),
    // File transports (only in production)
    ...(process.env.NODE_ENV === "production"
      ? [
          new DailyRotateFile({
            filename: "logs/error-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            level: "error",
            maxSize: "20m",
            maxFiles: "30d",
          }),
          new DailyRotateFile({
            filename: "logs/combined-%DATE%.log",
            datePattern: "YYYY-MM-DD",
            maxSize: "20m",
            maxFiles: "30d",
          }),
        ]
      : []),
  ],
  exitOnError: false,
});

// Request logging middleware
export const requestLogger = (
  req: Request,
  res: Response,
  next: () => void
) => {
  const { method, originalUrl, ip, body, query } = req;

  logger.http(`Incoming Request`, {
    method,
    url: originalUrl,
    ip,
    body,
    query,
  });

  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.http(`Request Completed`, {
      method,
      url: originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
    });
  });

  next();
};

// Error logging function
export const errorLogger = (error: Error, context?: string) => {
  logger.error(context || "Unhandled Error", {
    message: error.message,
    stack: error.stack,
  });
};

export default logger;
