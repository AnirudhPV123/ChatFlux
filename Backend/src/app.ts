import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import corsConfig from './config/corsConfig';
import { globalErrorHandler } from './middlewares/globalErrorHandler.middleware';
import { CustomError } from './utils/CustomError';
import userRouter from './routes/user.routes';

const app: Application = express();

// Global Middleware
app.use(cors(corsConfig));
app.use(helmet());
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());
app.use(morgan('combined'));

// Route Handlers
app.use('/api/v1/users', userRouter);

// Unknown Endpoint Handler
app.all('*', (req, res, next) => {
  const err = new CustomError(404, `Can't find ${req.originalUrl} on the server!`);
  next(err);
});

// Global Error Handler
app.use(globalErrorHandler);

export { app };
