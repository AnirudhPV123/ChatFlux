import RedisStore from 'connect-redis';
import session from 'express-session';
import { redisClient } from './';

const sessionConfig = session({
  store: new RedisStore({ client: redisClient }), // Use Redis as session store
  secret: process.env.SECTION_SECRET_KEY as string,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 12, // Session expiry: 12h
  },
});

export default sessionConfig;
