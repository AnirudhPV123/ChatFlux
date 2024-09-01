import dotenv from 'dotenv';
import connectDB from './db/index';
import { app } from './app';

dotenv.config({ path: './.env' });

const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    console.log('Database connected successfully.');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log('MONGODB connection FAILED: ', error);
    process.exit(1);
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
