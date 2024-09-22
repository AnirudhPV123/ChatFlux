import { NextFunction, Request, Response } from 'express';
import { logger } from '@/utils';

// Define a custom error interface
interface AppError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
}

const globalErrorHandler = (error: AppError, req: Request, res: Response, next: NextFunction) => {
  const statusCode = error.statusCode || 500;
  const status = error.status || 'error';
  const isOperational = error.isOperational || false;
  const stack = error.stack || 'No error stack available.';

  // Log the error details with more context
  logger.error({
    message: error.message,
    statusCode,
    status,
    isOperational,
    stack,
    method: req.method,
    url: req.url,
  });

  // Send a detailed error response in development, but a generic one in production
  if (process.env.NODE_ENV === 'development') {
    res.status(statusCode).json({ 
      statusCode,
      status,
      isOperational,
      message: error.message,
      stack,
    });
  } else {
    res.status(statusCode).json({
      statusCode,
      status,
      message: isOperational ? error.message : 'An unexpected error occurred',
    });
  }
};
export { globalErrorHandler };
