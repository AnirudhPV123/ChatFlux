import { User } from '../models/user.model.js';
import jwt from 'jsonwebtoken';
import { CustomError } from '../utils/CustomError.js';
import { asyncErrorHandler } from '../utils/asyncErrorHandler.js';

export const verifyJWT = asyncErrorHandler(async (req, _, next) => {
  const token = req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return next(new CustomError(401, 'Unauthorized request'));
  }

  let decodedtoken;
  try {
    decodedtoken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
  } catch (error) {
    return next(new CustomError(407, 'Expired token.'));
  }

  const user = await User.findById(decodedtoken?._id).select('-password -refreshToken');

  if (!user) {
    return next(new CustomError(401, 'Invalid Access Token'));
  }

  if (!user.isActive) {
    return next(new CustomError(401, 'User not found'));
  }

  req.user = user;
  next();
});
