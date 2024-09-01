import { UserType, User } from '../models/user.model';
import { asyncHandler } from '../utils/asyncHandler';
import { CustomError } from '../utils/CustomError';
import { CustomResponse } from '../utils/CustomResponse';
import { generateTokens } from '../utils/generateTokens';
import { loginValidatorSchema, registerValidatorSchema } from '../utils/validators/userValidators';
import { cookieConfig as options } from '../config/cookieConfig';
import { Request, Response } from 'express';

export const signUp = asyncHandler(async (req: Request, res: Response) => {
  const {
    error,
    value: { username, email, password },
  } = registerValidatorSchema.validate(req.body);

  if (error) {
    throw new CustomError(400, error.details[0].message);
  }

  const existingUser: UserType | null = await User.findOne({ email });

  if (existingUser) {
    throw new CustomError(409, 'Email already exists.');
  }

  const createdUser: UserType | null = await User.create({
    username,
    email,
    password,
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

export const login = asyncHandler(async (req, res) => {
  const {
    error,
    value: { email, password },
  } = loginValidatorSchema.validate(req.body);

  if (error) {
    throw new CustomError(400, error.details[0].message);
  } 

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
