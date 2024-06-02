import { Conversation } from '../models/conversation.model.js';
import { User } from '../models/user.model.js';
import { asyncErrorHandler } from '../utils/asyncErrorHandler.js';
import { CustomError } from '../utils/CustomError.js';
import { CustomResponse } from '../utils/CustomResponse.js';
import generateOTP from '../utils/generateOTP.js';
import sendSMS from '../utils/sendSMS.js';
import jwt from 'jsonwebtoken';

// @DESC generate access and refresh token
// @RETURN access and refresh token
// This function is typically called during user authentication.
const generateAccessAndRefreshToken = asyncErrorHandler(async (userId) => {
  const user = await User.findById(userId);
  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
});

// @DESC register user with phone number and send OTP SMS
// @METHOD post
// @PATH /user/register
export const registerUser = asyncErrorHandler(async (req, res, next) => {
  const { userName, phoneNumber, password, confirmPassword, gender } = req.body;

  if (!userName || !phoneNumber || !gender || !password || !confirmPassword) {
    return next(
      new CustomError(
        400,
        'Missing Required Fields: Please provide values for all required fields.',
      ),
    );
  }

  if (password !== confirmPassword) {
    return next(new CustomError(400, 'Password do not match'));
  }

  const existingUser = await User.findOne({ phoneNumber: phoneNumber });

  if (existingUser) {
    return next(new CustomError(400, 'Phone Number already exit try different'));
  }

  const existingUserName = await User.findOne({ userName });

  if (existingUserName) {
    return next(new CustomError(400, 'UserName already taken.'));
  }

  // profilePhoto
  const maleProfilePhoto = `https://avatar.iran.liara.run/public/boy?username=${userName}`;
  const femaleProfilePhoto = `https://avatar.iran.liara.run/public/girl?username=${userName}`;

  const { otp, otpExpiration } = generateOTP();

  const user = await User.create({
    userName,
    phoneNumber,
    password,
    gender,
    avatar: gender === 'male' ? maleProfilePhoto : femaleProfilePhoto,
    isActive: false,
    otp,
    otpExpiration,
  });

  const message = `Your OTP for ChatApp verification is: ${otp}`;
  await sendSMS(phoneNumber, message);
  return res
    .status(201)
    .json(
      new CustomResponse(
        201,
        'User created successfully. Please check your phone for verification.',
      ),
    );
});

// @DESC verify OTP with either phone number - update user DB(isActive,otp,otpExpiration)
// @METHOD post
// @PATH /user/verify
// @RETURN access and refresh token
export const verifyOTP = asyncErrorHandler(async (req, res, next) => {
  const { phoneNumber, otp } = req.body;
  if (!phoneNumber || !otp) {
    return next(
      new CustomError(
        400,
        'Missing Required Fields: Please provide values for all required fields.',
      ),
    );
  }

  const user = await User.findOne({ phoneNumber });

  if (!user) {
    return next(new CustomError(404, 'User not found'));
  }

  if (user.otp !== parseInt(otp) || user.otpExpiration <= Date.now()) {
    return next(new CustomError(404, 'Invalid or expired OTP.'));
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  user.isActive = true;
  user.otp = undefined;
  user.otpExpiration = undefined;
  refreshToken;
  await user.save();

  const updatedUser = await User.findById(user._id).select('-refreshToken -password');

  const options = {
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };

  res.cookie('accessToken', accessToken, options).cookie('refreshToken', refreshToken, options);
  res
    .status(200)
    .json(new CustomResponse(200, { user: updatedUser }, 'User verified successfully'));
});

// @DESC resend OTP with phone number
// @METHOD post
// @PATH /user/resend-otp
export const resendOTP = asyncErrorHandler(async (req, res, next) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return next(new CustomError(400, 'PhoneNumber must be required.'));
  }

  const existingUser = await User.findOne({ phoneNumber });

  if (existingUser && existingUser.isActive) {
    return next(new CustomError(400, 'Phone Number already exists'));
  }

  const { otp, otpExpiration } = generateOTP();

  await User.findOneAndUpdate(
    { phoneNumber },
    {
      $set: {
        otp,
        otpExpiration,
      },
    },
  );

  const message = `Your OTP for ChatApp verification is: ${otp}`;
  await sendSMS(phoneNumber, message);
  return res
    .status(200)
    .json(
      new CustomResponse(
        200,
        'OTP resent successfully. Please check your phone for the verification code.',
      ),
    );
});

// @DESC forgot password with phone number
// @METHOD post
// @PATH /user/forgot-password
// @UPDATE user DB(isActive,otp,otpExpiration)
export const forgotPassword = asyncErrorHandler(async (req, res, next) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return next(new CustomError('PhoneNumber must be required.'));
  }

  const existingUser = await User.findOne({ phoneNumber });

  if (!existingUser || !existingUser.isActive) {
    return next(new CustomError(400, 'Phone Number not exists'));
  }

  const { otp, otpExpiration } = generateOTP();

  await User.findOneAndUpdate(
    { phoneNumber },
    {
      $set: {
        isActive: false,
        otp,
        otpExpiration,
      },
    },
  );

  const message = `Your OTP for ChatApp verification is: ${otp}`;
  await sendSMS(phoneNumber, message);
  return res
    .status(200)
    .json(
      new CustomResponse(
        200,
        'Reset password OTP send successfully. Please check your phone for the verification code.',
      ),
    );
});

// @DESC reset password with phone number
// @METHOD post
// @PATH /user/reset-password
// @UPDATE user DB(isActive,otp,otpExpiration,password)
// @RETURN access and refresh token
export const resetPassword = asyncErrorHandler(async (req, res, next) => {
  const { phoneNumber, otp, newPassword, confirmPassword } = req.body;

  if (!phoneNumber) {
    return next(new CustomError(400, 'PhoneNumber must be required'));
  }

  const user = await User.findOne({ phoneNumber });

  if (!user) {
    return next(new CustomError(404, 'User not found'));
  }

  if (user.isActive) {
    return next(new CustomError(400, 'First call forgot password.'));
  }

  if (!otp && (!newPassword || !confirmPassword)) {
    return next(
      new CustomError(
        400,
        'Missing Required Fields: Please provide values for all required fields.',
      ),
    );
  }

  if ((otp && user.otp !== parseInt(otp)) || user.otpExpiration <= Date.now()) {
    return next(new CustomError(404, 'Invalid or expired OTP.'));
  } else if (!newPassword && !confirmPassword && otp) {
    return res.status(200).json(new CustomResponse(200, 'OTP verified successfully'));
  }

  if (newPassword !== confirmPassword) {
    return next(new CustomError(400, 'Password not match'));
  }

  user.isActive = true;
  user.otp = undefined;
  user.otpExpiration = undefined;
  user.password = newPassword;
  await user.save();

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id);

  const options = {
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };

  res.cookie('accessToken', accessToken, options).cookie('refreshToken', refreshToken, options);
  res.status(200).json(new CustomResponse(200, 'Password reset successfully'));
});

// @DESC login with phone number
// @METHOD post
// @PATH /user/login
// @RETURN access and refresh token
export const loginUser = asyncErrorHandler(async (req, res, next) => {
  const { phoneNumber, password } = req.body;

  if (!phoneNumber || !password) {
    return next(
      new CustomError(
        400,
        'Missing Required Fields: Please provide values for all required fields.',
      ),
    );
  }

  const existingUser = await User.findOne({ phoneNumber });

  if (!existingUser || !existingUser.isActive) {
    return next(new CustomError(400, 'Phone Number not exists'));
  }

  const isPasswordCorrect = await existingUser.isPasswordCorrect(password);

  if (!isPasswordCorrect) {
    return next(new CustomError(401, 'Incorrect password.'));
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(existingUser._id);

  existingUser.refreshToken = refreshToken;
  await existingUser.save();

  const userForReturn = await User.findById(existingUser._id).select('-refreshToken -password');

  const options = {
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };

  res.cookie('accessToken', accessToken, options).cookie('refreshToken', refreshToken, options);
  res
    .status(200)
    .json(new CustomResponse(200, { user: userForReturn }, 'User loggedIn successfully'));
});

// @DESC Refresh access and refresh token
// @METHOD post
// @PATH /user/refresh-token
// @RETURN new access and refresh token
export const refreshAccessAndRefreshToken = asyncErrorHandler(async (req, res, next) => {
  // Extract the incoming refresh token from cookies or request body
  const incomingRefreshToken = req.cookies?.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    return next(new CustomError(401, 'Unauthorized request'));
  }

  // Verify the incoming refresh token
  const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET_KEY);

  const user = await User.findById(decodedToken?._id);

  if (!user) {
    return next(new CustomError(401, 'Invalid refresh Token'));
  }

  // Check if the incoming refresh token matches the user's refresh token
  if (user?.refreshToken !== incomingRefreshToken) {
    next(new CustomError(401, 'Refresh token is expired'));
    return;
  }

  // Generate new access and refresh tokens
  const { accessToken, refreshToken: newRefreshToken } = await generateAccessAndRefreshToken(
    decodedToken._id,
  );

  // Configure options for setting cookies
  const options = {
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };

  res.cookie('accessToken', accessToken, options).cookie('refreshToken', newRefreshToken, options);
  res.status(200).json(new CustomResponse(200, 'User verified successfully'));
});

// @DESC Get user profile
// @METHOD get
// @PATH /user/profile
export const getUserProfile = asyncErrorHandler(async (req, res, next) => {
  res
    .status(200)
    .json(new CustomResponse(200, { user: req.user }, 'User details fetched successfully'));
});

// @DESC logout user
// @METHOD get
// @PATH /user/logout
export const logoutUser = asyncErrorHandler(async (req, res, next) => {
  // Configure options for setting cookies
  const options = {
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };

  res.cookie('accessToken', '', options).cookie('refreshToken', '', options);
  res.status(200).json(new CustomResponse(200, 'User logout successfully'));
});

// @DESC get all users
// @METHOD get
// @PATH /user/users
// @RETURN users
export const getAvailableUsers = asyncErrorHandler(async (req, res, next) => {
  const users = await User.aggregate([
    {
      $match: {
        _id: {
          $ne: req.user._id, // avoid logged in user
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

  // Configure options for setting cookies
  const options = {
    httpOnly: true,
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };

  res.status(200).json(new CustomResponse(200, users, 'Fetch other users successfully'));
});
