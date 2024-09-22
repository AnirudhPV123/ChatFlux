import { User, UserType } from '../models/user.model';
import { CustomError, asyncHandler } from '../utils';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const verifyJWT = asyncHandler(async (req, _, next) => {
  try {
    // Extract token from cookies or headers
    const token: string =
      req.cookies?.accessToken || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      throw new CustomError(401, 'Unauthorized request.');
    }

    let decodedToken;
    try {
      decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY as string) as JwtPayload;
    } catch (error: Error | any) {
      // Check for specific error types
      if (error.name === 'TokenExpiredError') {
        throw new CustomError(401, 'Token has expired.');
      }
      throw new CustomError(403, 'Invalid token.');
    }

    type User = UserType & { _id: string };
    // Find user by ID from the decoded token
    const user: User = await User.findById(decodedToken._id).select('-password -refreshToken');

    if (!user) {
      throw new CustomError(403, 'Invalid Access Token.');
    }

    // Attach user to the request object
    req.user = user;
    next();
  } catch (error: Error | any) {
    // Handle errors more explicitly
    throw new CustomError(
      error.statusCode || 500,
      error.message || 'An error occurred during token verification.',
    );
  }
});
