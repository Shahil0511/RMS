import { Request, Response, NextFunction } from "express";

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const error = err as AppError;

  error.statusCode = error.statusCode || 500;

  if (process.env.NODE_ENV === "development") {
    res.status(error.statusCode).json({
      status: "error",
      message: error.message,
      stack: error.stack,
      error: error,
    });
  } else {
    // Production error handling
    if (error.isOperational) {
      res.status(error.statusCode).json({
        status: "error",
        message: error.message,
      });
    } else {
      // Programming or unknown errors - don't leak error details
      console.error("ERROR 💥", error);
      res.status(500).json({
        status: "error",
        message: "Something went wrong",
      });
    }
  }
};
