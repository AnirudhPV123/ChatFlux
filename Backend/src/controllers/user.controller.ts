import { UserType, User } from '../models/user.model';
import { asyncHandler } from '../utils/asyncHandler';
import { CustomError } from '../utils/CustomError';
import { CustomResponse } from '../utils/CustomResponse';
import { generateTokens } from '../utils/generateTokens';
import {
  forgotPasswordGenerateOtpValidator,
  emailAndPasswordValidator,
  signUpGenerateOtpValidator,
  emailAndOtpValidator,
} from '../utils/validators/userValidators';
import { cookieConfig as options } from '../config/cookieConfig';
import { Request, Response } from 'express';
import { getRedisValue } from '../utils/redisOperations';
import { handleOtpProcess } from '../utils/handleOtpProcess';
import { validateRequest } from '../utils/validateRequest';

export const signUpGenerateOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, ...userData } = validateRequest({
    schema: signUpGenerateOtpValidator,
    data: req.body,
  });

  const existingUser: UserType | null = await User.findOne({ email });

  if (existingUser) {
    throw new CustomError(409, 'Email already exists.');
  }

  handleOtpProcess({ email, expiryTime: 60 * 5, data: userData });

  return res.status(200).json(new CustomResponse(201, 'OTP generated successfully.'));
});

export const signUpVerifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = validateRequest({ schema: emailAndOtpValidator, data: req.body });

  const redisData: object | null = await getRedisValue(email as string);
  // TODO: test putting this null checking code to the getRedisValue function itself
  if (redisData === null) {
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

  console.log(redisData);

  if (otp !== redisOtp) {
    throw new CustomError(401, 'Invalid OTP.');
  }

  const createdUser: UserType | null = await User.create({
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

// otp generate
export const forgotPasswordGenerateOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email } = validateRequest({ schema: forgotPasswordGenerateOtpValidator, data: req.body });

  const user: UserType | null = await User.findOne({ email });
  if (!user) {
    throw new CustomError(404, 'User not found.');
  }

  handleOtpProcess({ email, expiryTime: 10, data: {} });

  return res.status(200).json(new CustomResponse(200, 'OTP sent successfully.'));
});

// otp validate and permit reset password
export const forgotPasswordVerifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = validateRequest({ schema: emailAndOtpValidator, data: req.body });

  const redisData: object | null = await getRedisValue(email as string);
  if (redisData === null) {
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

  const user: UserType | null = await User.findOne({ email });

  if (!user) {
    throw new CustomError(404, 'User not found.');
  }

  user.password = password;
  await user.save();

  return res.status(200).json(new CustomResponse(200, 'Password reset successfully.'));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = validateRequest({
    schema: emailAndPasswordValidator,
    data: req.body,
  });

  const user: UserType | null = await User.findOne({ email });

  if (!user) {
    throw new CustomError(404, 'User not found.');
  }

  const isPasswordCorrect: boolean = await user.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    throw new CustomError(401, 'Invalid Password.');
  }

  const { accessToken, refreshToken } = await generateTokens({
    userId: user._id as string,
    isGenerateRefreshToken: true,
  });

  //  // Store refresh token in DB
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
