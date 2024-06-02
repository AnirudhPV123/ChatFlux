import dotenv from 'dotenv';
import connectDB from './db/db.js';
import { app, server } from './socket/socket.js';

dotenv.config({ path: './.env' });

import "./app.js"
 

connectDB()
  .then((res) => {
    app.on('Error', (error) => {
      console.log('ERRR: ', error);
      throw error;
    });
    server.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log('MONGODB connection FAILED: ', error);
  });

