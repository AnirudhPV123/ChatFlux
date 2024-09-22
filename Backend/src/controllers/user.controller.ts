import { UserType, User } from '@/models/user.model';
import {
  asyncHandler,
  CustomError,
  CustomResponse,
  generateTokens,
  handleOtpProcess,
  validateRequest,
} from '@/utils';
import jwt, { JwtPayload } from 'jsonwebtoken';
import {
  forgotPasswordGenerateOtpValidator,
  emailAndPasswordValidator,
  signUpGenerateOtpValidator,
  emailAndOtpValidator,
} from '@/utils/validators/userValidators';
import { cookieConfig as options } from '@/config';
import { Request, Response } from 'express';
import { getRedisValue } from '@/utils/redisOperations';
import { LoginWithAuthProvidersProps } from './types';

// Generate OTP and save user data and OTP in Redis session
export const signUpGenerateOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, ...userData } = validateRequest({
    schema: signUpGenerateOtpValidator,
    data: req.body,
  });

  if (await User.findOne({ email })) {
    throw new CustomError(409, 'Email already exists.');
  }

  handleOtpProcess({ email, expiryTime: 60 * 5, data: userData });
  return res.status(200).json(new CustomResponse(201, 'OTP generated successfully.'));
});

// Verify OTP with Redis and create user
export const signUpVerifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = validateRequest({ schema: emailAndOtpValidator, data: req.body });

  const redisData = await getRedisValue(email as string);

  if (!redisData) {
    throw new CustomError(404, 'OTP expired.');
  }

  const {
    username,
    password,
    dateOfBirth,
    gender,
    otp: redisOtp,
  } = redisData as {
    username: string;
    password: string;
    dateOfBirth: string;
    gender: string;
    otp: string;
  };

  if (otp !== redisOtp) {
    throw new CustomError(401, 'Invalid OTP.');
  }

  const createdUser = await User.create({
    username,
    email,
    password,
    dateOfBirth,
    gender,
  });

  const { accessToken, refreshToken } = await generateTokens({
    userId: createdUser._id as string,
    isGenerateRefreshToken: true,
  });

  // Store the refresh token in DB
  createdUser.refreshToken = refreshToken;
  await createdUser.save;

  // Remove password and refreshToken before sending to frontend
  const {
    password: _password,
    refreshToken: _refreshToken,
    ...userWithoutSensitiveInfo
  } = createdUser.toObject();

  return res
    .status(201)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(new CustomResponse(201, userWithoutSensitiveInfo, 'User registered successfully.'));
});

// Generate OTP for password reset
export const forgotPasswordGenerateOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email } = validateRequest({ schema: forgotPasswordGenerateOtpValidator, data: req.body });

  const user = await User.findOne({ email });
  if (!user || user?.provider) {
    throw new CustomError(404, 'User not found.');
  }

  handleOtpProcess({ email, expiryTime: 60 * 5, data: {} });
  return res.status(200).json(new CustomResponse(200, 'OTP sent successfully.'));
});

// Verify OTP for password reset
export const forgotPasswordVerifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = validateRequest({ schema: emailAndOtpValidator, data: req.body });

  const redisData = await getRedisValue(email as string);
  if (!redisData) {
    throw new CustomError(404, 'OTP expired.');
  }

  const { otp: redisOtp } = redisData as { otp: string };
  if (otp !== redisOtp) {
    throw new CustomError(401, 'Invalid OTP.');
  }

  return res.status(200).json(new CustomResponse(200, 'OTP validated successfully.'));
});

// reset password
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = validateRequest({
    schema: emailAndPasswordValidator,
    data: req.body,
  });

  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError(404, 'User not found.');
  }

  user.password = password;
  await user.save();

  const {
    password: _password,
    refreshToken: _refreshToken,
    ...userWithoutSensitiveInfo
  } = user.toObject();

  return res
    .status(200)
    .json(new CustomResponse(200, userWithoutSensitiveInfo, 'Password reset successfully.'));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = validateRequest({
    schema: emailAndPasswordValidator,
    data: req.body,
  });

  const user: UserType | null = await User.findOne({ email });

  // if email found but its social login
  if (!user || user?.provider) {
    throw new CustomError(404, 'User not found.');
  }

  if (!(await user.isPasswordCorrect(password))) {
    throw new CustomError(401, 'Invalid Password.');
  }

  const { accessToken, refreshToken } = await generateTokens({
    userId: user._id as string,
    isGenerateRefreshToken: true,
  });

  // Store refresh token in DB
  user.refreshToken = refreshToken;
  await user.save;

  // Remove password and refreshToken before sending to frontend
  const {
    password: _password,
    refreshToken: _refreshToken,
    ...userWithoutSensitiveInfo
  } = user.toObject();

  return res
    .status(200)
    .cookie('accessToken', accessToken, options)
    .cookie('refreshToken', refreshToken, options)
    .json(new CustomResponse(200, userWithoutSensitiveInfo, 'User logged in successfully.'));
});

// Login with social providers (eg: github, google)
export const loginWithAuthProviders = async ({
  provider,
  providerId,
  username,
  email,
  avatar,
}: LoginWithAuthProvidersProps) => {
  try {
    let user = await User.findOne({ $or: [{ providerId }, { email }] });
    if (!user) {
      user = await User.create({
        provider: provider,
        providerId: providerId,
        username: username,
        email: email,
        avatar: avatar,
      });
    }

    const { accessToken, refreshToken } = await generateTokens({
      userId: user?._id as string,
      isGenerateRefreshToken: true,
    });

    user.refreshToken = refreshToken;
    await user.save;

    return { accessToken, refreshToken };
  } catch (error) {
    throw new CustomError(500, 'Something went wrong. Please try again.');
  }
};

// Get user details
export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById((req.user as any)._id).select(
    '-password -refreshToken -provider -providerId',
  );

  if (!user) {
    throw new CustomError(404, 'User not found');
  }

  res.status(200).json(new CustomResponse(200, user, 'Fetched user details successfully'));
});

// Logout user
export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie('accessToken', options).clearCookie('refreshToken', options);
  res.status(200).json(new CustomResponse(200, 'User logout successfully'));
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new CustomError(403, 'Refresh token required.');
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET_KEY as string,
    ) as JwtPayload;

    const user = await User.findById(decodedToken._id);

    if (!user || user?.refreshToken !== incomingRefreshToken) {
      throw new CustomError(403, 'Invalid or expired refresh token.');
    }

    const { accessToken } = await generateTokens({
      userId: user._id as string,
    });

    return res
      .status(200)
      .cookie('accessToken', accessToken, options)
      .json(new CustomResponse(200, 'Access token refreshed successfully'));
  } catch (error) {
    throw new CustomError(403, 'Invalid or expired refresh token.');
  }
});

// Get all other users
export const getAvailableUsers = asyncHandler(async (req: Request, res: Response) => {
  const users = await User.aggregate([
    {
      $match: {
        _id: {
          $ne: (req.user as any)._id, // avoid logged in user
        },
      },
    },
    {
      $project: {
        refreshToken: 0,
        password: 0,
        gender: 0,
        isActive: 0,
      },
    },
  ]);

  res.status(200).json(new CustomResponse(200, users, 'Fetch other users successfully'));
});
