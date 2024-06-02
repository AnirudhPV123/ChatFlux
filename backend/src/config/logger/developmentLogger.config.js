import { createLogger, format, transports } from 'winston';
const { combine, timestamp, label, printf, colorize } = format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${level} ${timestamp} ${message}`;
});

const developmentLogger = () => {
  return createLogger({
    format: combine(colorize(), timestamp({ format: 'HH:mm:ss' }), myFormat),
    transports: [new transports.File({ filename: 'siteErrorsDev.log' }), new transports.Console()],
  });
};

export { developmentLogger };
