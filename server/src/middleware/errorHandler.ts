// ──────────────────────────────────────────────
// Global Error Handler Middleware
// ──────────────────────────────────────────────

import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

/**
 * Custom application error class with HTTP status code
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  public details?: unknown;

  constructor(message: string, statusCode: number = 500, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 404 Not Found handler — must be registered after all routes
 */
export function notFoundHandler(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404));
}

/**
 * Global error handler middleware
 * Catches all errors and returns a structured JSON response
 */
export function globalErrorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Default error values
  let statusCode = 500;
  let errorName = 'Internal Server Error';
  let message = 'An unexpected error occurred';
  let details: unknown = undefined;

  // Handle known error types
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorName = err.name;
    message = err.message;
    details = err.details;
  } else if (err.name === 'ValidationError') {
    // Mongoose/MongoDB validation errors
    statusCode = 400;
    errorName = 'Validation Error';
    message = err.message;
  } else if (err.name === 'CastError') {
    // Invalid ID format
    statusCode = 400;
    errorName = 'Invalid ID';
    message = 'Invalid resource identifier format';
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorName = 'Authentication Error';
    message = 'Invalid or expired token';
  } else if ((err as { code?: string }).code === 'permission-denied') {
    statusCode = 403;
    errorName = 'Permission Denied';
    message = 'You do not have permission to perform this action';
  } else if ((err as { code?: string }).code === 'not-found') {
    statusCode = 404;
    errorName = 'Not Found';
    message = 'The requested resource was not found';
  } else if ((err as { code?: string }).code === 'already-exists') {
    statusCode = 409;
    errorName = 'Conflict';
    message = 'The resource already exists';
  }

  // Log the error
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.originalUrl,
    statusCode,
    errorName,
    message,
    ip: req.ip,
    userId: (req as { user?: { uid?: string } }).user?.uid || 'anonymous',
  };

  if (env.NODE_ENV === 'development') {
    console.error('❌ Error:', {
      ...logData,
      stack: err.stack,
      details,
    });
  } else {
    console.error('❌ Error:', logData);
  }

  // Build response
  const response: Record<string, unknown> = {
    success: false,
    error: errorName,
    message,
  };

  if (details) {
    response.details = details;
  }

  if (env.NODE_ENV === 'development' && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}
