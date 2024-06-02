import { createLogger, format, transports } from 'winston';
const { combine, timestamp, label, printf, colorize } = format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${level} ${timestamp} ${message}`;
});

const productionLogger = () => {
  return createLogger({
    format: combine(timestamp(), myFormat),
    transports: [new transports.File({ filename: 'siteErrors.log' })],
  });
};

export { productionLogger };
