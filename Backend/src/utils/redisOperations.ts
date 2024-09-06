import { redisClient } from '../config/redisConfig';

type SetRedisValueProps = {
  key: string;
  data: object;
  expTime: number;
};

const setRedisValue = async ({ key, data, expTime }: SetRedisValueProps): Promise<void> => {
  try {
    const stringValue = JSON.stringify(data);
    await redisClient.setEx(key, expTime, stringValue);
  } catch (error) {
  console.log(`Error setting value in Redis: ${error}`);
  }
};

const getRedisValue = async (key: string): Promise<object | null> => {
  try {
    const data = await redisClient.get(key);
    if (data === null) {
      return null;
    }
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Error getting or parsing value from Redis: ${error}`);
  }
};

export {getRedisValue,setRedisValue}