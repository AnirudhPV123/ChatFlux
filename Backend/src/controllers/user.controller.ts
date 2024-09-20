import { UserType, User } from '@/models/user.model';
import { asyncHandler } from '@/utils/asyncHandler';
import { CustomError } from '@/utils/CustomError';
import { CustomResponse } from '@/utils/CustomResponse';
import { generateTokens } from '@/utils/generateTokens';
import {
  forgotPasswordGenerateOtpValidator,
  emailAndPasswordValidator,
  signUpGenerateOtpValidator,
  emailAndOtpValidator,
} from '@/utils/validators/userValidators';
import { cookieConfig as options } from '@/config/cookieConfig';
import { Request, Response } from 'express';
import { getRedisValue } from '@/utils/redisOperations';
import { handleOtpProcess } from '@/utils/handleOtpProcess';
import { validateRequest } from '@/utils/validateRequest';
import { LoginWithAuthProvidersProps } from './types';

// Generate otp and save user data and otp in redis session
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

// Verify otp with otp in redis session and create user
export const signUpVerifyOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email, otp } = validateRequest({ schema: emailAndOtpValidator, data: req.body });

  const redisData: object | null = await getRedisValue(email as string);

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

  if (otp !== redisOtp) {
    throw new CustomError(401, 'Invalid OTP.');
  }

  const maleProfilePhoto = `https://avatar.iran.liara.run/public/boy?username=${username}`;
  const femaleProfilePhoto = `https://avatar.iran.liara.run/public/girl?username=${username}`;

  const createdUser: UserType | null = await User.create({
    username,
    email,
    password,
    dateOfBirth,
    gender,
    avatar: gender === 'male' ? maleProfilePhoto : femaleProfilePhoto,
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

// Generate otp and save key as email and otp in redis session
export const forgotPasswordGenerateOtp = asyncHandler(async (req: Request, res: Response) => {
  const { email } = validateRequest({ schema: forgotPasswordGenerateOtpValidator, data: req.body });

  const user: UserType | null = await User.findOne({ email });
  if (!user || user?.provider) {
    throw new CustomError(404, 'User not found.');
  }

  handleOtpProcess({ email, expiryTime: 60 * 5, data: {} });

  return res.status(200).json(new CustomResponse(200, 'OTP sent successfully.'));
});

// Verify otp with redis otp and permit reset password
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

// Login with other social logins like google and github
export const loginWithAuthProviders = async ({
  provider,
  providerId,
  username,
  email,
  avatar,
}: LoginWithAuthProvidersProps) => {
  // console.log('avatar', avatar);
  try {
    let user = await User.findOne({ $or: [{ providerId: providerId }, { email: email }] });
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

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const id = (req.user as any)._id;
  const user = await User.findById(id).select('-password -refreshToken -provider -providerId');
  if (!user) {
    throw new CustomError(404, 'User not found');
  }
  // console.log(user);

  res.status(200).json(new CustomResponse(200, user));
});

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  res.cookie('accessToken', '', options).cookie('refreshToken', '', options);
  res.status(200).json(new CustomResponse(200, 'User logout successfully'));
});

// @DESC get all users
// @METHOD get
// @PATH /user/users
// @RETURN users
export const getAvailableUsers = asyncHandler(async (req: Request, res: Response) => {
  // console.log("hi here");
  
  const id = (req.user as any)._id;

  const users = await User.aggregate([
    {
      $match: {
        _id: {
          $ne: id, // avoid logged in user
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

  // console.log("avoided logged in user", users);

  res.status(200).json(new CustomResponse(200, users, 'Fetch other users successfully'));
});
