import { developmentLogger } from '../config/logger/developmentLogger.config.js';
import { productionLogger } from '../config/logger/productionLogger.config.js';

let logger = null;

if (process.env.NODE_ENV === 'development') {
  logger = developmentLogger();
}

if (process.env.NODE_ENV === 'production') {
  logger = productionLogger();
}

export { logger };
