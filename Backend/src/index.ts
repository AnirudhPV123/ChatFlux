import dotenv from 'dotenv';
import connectDB from './db/index';
import { server } from './socket/socket';
dotenv.config({ path: './.env' });
import './app';
import { CustomError } from './utils';

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    console.log('Database connected successfully.');

    server.listen(PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log('MONGODB connection FAILED: ', error);
    throw new CustomError(500, 'MONGODB connection FAILED: ');
    // process.exit(1);
  });

// Optionally, handle uncaught exceptions and unhandled rejections globally
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
