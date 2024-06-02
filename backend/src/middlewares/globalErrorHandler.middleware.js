import { logger } from '../utils/logger.js';

const globalErrorHandler = (error, req, res, next) => {
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  // logger - winston
  logger.error(error);

  res.status(error.statusCode).json({
    statusCode: error.statusCode,
    status: error.status,
    isOperational: error.isOperational,
    message: error.message,
    stack: error.stack,
  });
};
export { globalErrorHandler };