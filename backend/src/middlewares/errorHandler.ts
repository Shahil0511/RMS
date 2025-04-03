import { Request, Response, NextFunction } from "express";
import logger from "../utils/logger";

export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public details?: any;

  constructor(
    message: string,
    statusCode: number,
    details?: any,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = err instanceof AppError ? err : new AppError(err.message, 500);

  // Log the error
  logger.error({
    message: error.message,
    statusCode: error.statusCode,
    stack: error.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    details: error.details,
  });

  // Determine response based on environment
  const isProduction = process.env.NODE_ENV === "production";
  const response: any = {
    status: "error",
    message: error.message,
    ...(!isProduction && { stack: error.stack }),
  };

  // Include details if they exist
  if (error.details) {
    response.details = error.details;
  }

  // Special handling for certain status codes
  if (error.statusCode === 401) {
    response.message = response.message || "Unauthorized";
    res.setHeader("WWW-Authenticate", "Bearer");
  }

  // Send response
  res.status(error.statusCode).json(response);
};

// 404 error generator for routes that don't exist
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  next(new AppError(`Cannot ${req.method} ${req.path}`, 404));
};

// Async error handler wrapper for controllers
export const asyncHandler =
  (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
