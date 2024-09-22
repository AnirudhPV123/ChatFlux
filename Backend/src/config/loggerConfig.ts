import { format, transports } from 'winston';

const { combine, timestamp, printf, colorize, errors } = format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${level}: ${timestamp} - ${stack || message}`;
});

const loggerConfig = {
  development: {
    format: combine(
      colorize(),
      timestamp({ format: 'HH:mm:ss' }),
      errors({ stack: true }),
      logFormat,
    ),
    transports: [
      new transports.File({ filename: 'logs/siteErrorsDev.log', level: 'error' }),
      new transports.Console({ level: 'debug' }),
    ],
  },
  production: {
    format: combine(
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      errors({ stack: true }),
      logFormat,
    ),
    transports: [new transports.File({ filename: 'siteErrors.log' })],
  },
};

export default loggerConfig;
