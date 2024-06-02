function generateOTP(length = 6) {
  const chars = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += chars[Math.floor(Math.random() * chars.length)];
  }

  const otpExpiration = Date.now() + 5 * 60 * 1000; // Set OTP expiration to 5 minutes

  return { otp, otpExpiration };
}

export default generateOTP;
