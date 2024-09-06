import { createClient } from 'redis';

// Create and configure a Redis client
const createRedisClient = () => {
  return createClient({
    url: `redis://${process.env.REDIS_HOST || '127.0.0.1'}:${process.env.REDIS_PORT || 6379}`,
    password: process.env.REDIS_PASSWORD || '',
  });
};

// Initialize Redis client
const redisClient = createRedisClient();

// Handle connection errors
redisClient.on('error', (err: Error) => {
  console.error(`Error connecting to Redis: ${err.message}`);
});

async function redisConnect() {
  await redisClient.connect();
}

redisConnect();

export { redisClient };
