import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { CustomError } from './utils/CustomError.js';
import { globalErrorHandler } from './middlewares/globalErrorHandler.middleware.js';
import { app } from './socket/socket.js';

// configuration
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

// import routes
import userRouter from './routes/user.route.js';
import messageRouter from './routes/message.route.js';
import chatRouter from './routes/chat.route.js';

// route declaration
app.use('/api/v1/users', userRouter);
app.use('/api/v1/message', messageRouter);
app.use('/api/v1/chat', chatRouter);

//error handler for handling requests to undefined routes
app.all('*', (req, res, next) => {
  const err = new CustomError(404, `Can't find ${req.originalUrl} on the server!`);
  next(err);
});

app.use(globalErrorHandler);
