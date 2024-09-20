import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import morgan from 'morgan';
import corsConfig from './config/corsConfig';
import { globalErrorHandler } from './middlewares/globalErrorHandler.middleware';
import { CustomError } from './utils/CustomError';
import userRouter from './routes/user.routes';
import chatRouter from './routes/chat.routes';
import passport from 'passport';
import session from 'express-session';
import './config/passportConfig';
import { app } from './socket/socket';

// Global Middleware
app.use(cors(corsConfig));
app.use(
  session({
    secret: process.env.SECTION_SECRET_KEY as string,
    resave: false,
    saveUninitialized: true,
  }),
);
app.use(passport.initialize());
app.use(passport.session());
app.use(helmet());
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());
app.use(morgan('combined'));

// Route Handlers
app.use('/api/v1/users', userRouter);
app.use('/api/v1/chat', chatRouter);

// Unknown Endpoint Handler
app.all('*', (req, res, next) => {
  const err = new CustomError(404, `Can't find ${req.originalUrl} on the server!`);
  next(err);
});

// Global Error Handler
app.use(globalErrorHandler);

// export { server };
