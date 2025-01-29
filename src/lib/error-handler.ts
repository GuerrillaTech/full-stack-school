import { NextApiRequest, NextApiResponse } from 'next';
import logger, { handleError } from './logger';
import { ZodError } from 'zod';

// Custom error classes
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500, isOperational: boolean = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Centralized error handling middleware
export const errorHandler = (
  err: Error | AppError | ZodError, 
  req: NextApiRequest, 
  res: NextApiResponse
) => {
  let statusCode = 500;
  let errorResponse = {
    status: 'error',
    message: 'Internal Server Error',
    details: {},
  };

  // Handle different types of errors
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorResponse.message = err.message;
  } 
  else if (err instanceof ZodError) {
    statusCode = 400;
    errorResponse.message = 'Validation Error';
    errorResponse.details = err.errors;
  }
  else if (err instanceof Error) {
    errorResponse.message = err.message;
  }

  // Log the error
  handleError(err, {
    url: req.url,
    method: req.method,
    body: req.body,
  });

  // Send error response
  res.status(statusCode).json(errorResponse);
};

// Async error wrapper to handle async route handlers
export const asyncHandler = (fn: Function) => {
  return async (req: NextApiRequest, res: NextApiResponse, next: Function) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      errorHandler(error, req, res);
    }
  };
};

// Global unhandled rejection and uncaught exception handlers
process.on('unhandledRejection', (reason: Error) => {
  logger.error('Unhandled Rejection:', {
    message: reason.message,
    stack: reason.stack,
  });
  process.exit(1);
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', {
    message: error.message,
    stack: error.stack,
  });
  process.exit(1);
});
