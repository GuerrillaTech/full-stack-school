import winston from 'winston';
import { format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

// Custom log levels with severity
const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Custom log format
const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.errors({ stack: true }),
  format.splat(),
  format.json()
);

// Console transport
const consoleTransport = new winston.transports.Console({
  format: format.combine(
    format.colorize(),
    format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
  ),
});

// File transport with daily rotation
const fileTransport = new DailyRotateFile({
  filename: path.join(process.cwd(), 'logs', 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: logFormat,
});

// Error file transport
const errorTransport = new DailyRotateFile({
  filename: path.join(process.cwd(), 'logs', 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: logFormat,
});

// Create logger
const logger = winston.createLogger({
  levels: logLevels,
  format: logFormat,
  transports: [
    consoleTransport,
    fileTransport,
    errorTransport,
  ],
});

// Middleware for logging HTTP requests
export const loggerMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Log request details
  logger.http(`${req.method} ${req.url} - User: ${req.user?.id || 'Anonymous'}`);

  // Capture original end function
  const originalEnd = res.end;
  res.end = function (...args) {
    // Log response details
    const duration = Date.now() - startTime;
    logger.http(`${req.method} ${req.url} - Status: ${res.statusCode} - Duration: ${duration}ms`);
    
    // Call original end function
    originalEnd.apply(this, args);
  };

  next();
};

// Centralized error handling
export const handleError = (error, context = {}) => {
  logger.error(`Error: ${error.message}`, {
    stack: error.stack,
    ...context,
  });
};

// Audit logging for critical actions
export const auditLog = (action: string, user: any, details: any = {}) => {
  logger.info(`AUDIT: ${action}`, {
    userId: user.id,
    userRole: user.role,
    ...details,
  });
};

export default logger;
