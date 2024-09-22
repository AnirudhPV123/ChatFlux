import { Request, Response } from 'express';
import passport from 'passport';
import { cookieConfig as options } from '@/config';

interface UserTokens {
  accessToken: string;
  refreshToken: string;
}

// Utility function to handle authentication callbacks
const handleAuthCallback = (provider: string) => {
  return (req: Request, res: Response) => {
    passport.authenticate(provider, (err: Error, user: UserTokens) => {
      if (err || !user) {
        const errorMessage = `Failed to authenticate with ${provider}. Please try again later.`;
        const redirectUrl = `${process.env.CORS_ORIGIN}/${provider}?error=${encodeURIComponent(errorMessage)}`;
        return res.redirect(redirectUrl);
      }

      const { accessToken, refreshToken } = user;
      res.cookie('accessToken', accessToken, options);
      res.cookie('refreshToken', refreshToken, options);
      return res.redirect(process.env.CORS_ORIGIN as string);
    })(req, res);
  };
};

export default handleAuthCallback;
