import { User } from '@/models/user.model';
import { CustomError } from './';

type GenerateTokensProps = {
  userId: string;
  isGenerateRefreshToken?: boolean;
};

const generateTokens = async ({ userId, isGenerateRefreshToken = false }: GenerateTokensProps) => {
  try {
    const user = await User.findById(userId);

    if (!user) {
      throw new CustomError(404, 'User not found');
    }

    // Generate access token
    const accessToken: string = user.generateAccessToken();

    // Generate refresh token - if requested
    if (isGenerateRefreshToken) {
      const refreshToken: string = user.generateRefreshToken();
      user.refreshToken = refreshToken;
      await user.save({ validateBeforeSave: false });

      // Return both access and refresh token
      return { accessToken, refreshToken };
    }

    // Return only access token
    return { accessToken };
  } catch (error) {
    throw new CustomError(500, 'Something went wrong while generating access and refresh token');
  }
};

export default generateTokens;
