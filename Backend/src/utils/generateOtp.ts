import crypto from 'crypto';

export const generateOtp = () => {
  const length = 6;
  const otp = crypto
    .randomInt(0, Math.pow(10, length)) // Generates a random integer between 0 and 10^length
    .toString()
    .padStart(length, '0'); // Pads the OTP with leading zeros if necessary

  return otp;
};
