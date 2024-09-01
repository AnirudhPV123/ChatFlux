import { createLogger } from 'winston';
import { loggerConfig } from '../config/loggerConfig';

const environment = process.env.NODE_ENV === 'development' ? 'development' : 'production';

const logger = createLogger(loggerConfig[environment]);

export { logger };
