export const cookieConfig = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // Set to true if using HTTPS in production
};
