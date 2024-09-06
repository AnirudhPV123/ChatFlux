import { generateOtp } from './generateOtp';
import { setRedisValue } from './redisOperations';
import sendEmailVerification from './sendEmailVerification';

const handleOtpProcess = async ({
  email,
  expiryTime,
  data,
}: {
  email: string;
  expiryTime: number;
  data: object;
}) => {
  const otp = generateOtp();
  sendEmailVerification({ email, otp });
  setRedisValue({
    key: email,
    expTime: expiryTime,
    data: { ...data, otp },
  });
};

export { handleOtpProcess };
