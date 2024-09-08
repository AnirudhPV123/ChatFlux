import passport from 'passport';
import { cookieConfig as options } from '../config/cookieConfig';
import { Request, Response } from 'express';

const googleLogin = passport.authenticate('google', { scope: ['profile', 'email'] });

const googleLoginCallback = (req: Request, res: Response) => {
  passport.authenticate(
    'google',
    (err: Error, user: { accessToken: string; refreshToken: string }) => {
      const { accessToken, refreshToken } = user;

      if (err) {
        const errorMessage = 'Failed to authenticate with Google. Please try again later.';
        const redirectUrl = `${process.env.CORS_ORIGIN}/login?error=${encodeURIComponent(errorMessage)}`;
        return res.redirect(redirectUrl);
      }

      res.cookie('accessToken', accessToken, options);
      res.cookie('refreshToken', refreshToken, options);
      return res.redirect(`${process.env.CORS_ORIGIN}` as string);
    },
  )(req, res);
};

const githubLogin = passport.authenticate('github', { scope: ['profile', 'email'] });

const githubLoginCallback = (req: Request, res: Response) => {
  passport.authenticate(
    'github',
    (err: Error, user: { accessToken: string; refreshToken: string }) => {
      const { accessToken, refreshToken } = user;

      if (err) {
        const errorMessage = 'Failed to authenticate with Github. Please try again later.';
        const redirectUrl = `${process.env.CORS_ORIGIN}/github?error=${encodeURIComponent(errorMessage)}`;
        return res.redirect(redirectUrl);
      }

      res.cookie('accessToken', accessToken, options);
      res.cookie('refreshToken', refreshToken, options);
      return res.redirect(`${process.env.CORS_ORIGIN}` as string);
    },
  )(req, res);
};

export { googleLogin, googleLoginCallback, githubLogin, githubLoginCallback };
