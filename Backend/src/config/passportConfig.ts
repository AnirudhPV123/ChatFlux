import { loginWithAuthProviders } from '../controllers/user.controller';
import { CustomError } from '../utils/CustomError';
import { logger } from '../utils/logger';
import passport, { DoneCallback, Profile } from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as GithubStrategy } from 'passport-github2';

// google
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL: '/api/v1/users/google/callback',
      scope: ['profile', 'email'],
    },
    async function (accessToken, refreshToken, profile: Profile, cb) {
      try {
        const { accessToken, refreshToken } = await loginWithAuthProviders({
          provider: 'google',
          providerId: profile.id,
          email: profile.emails?.[0].value,
          username: profile.displayName,
          avatar: profile.photos?.[0].value,
        });
        const user = { accessToken, refreshToken };
        cb(null, user);
      } catch (error) {
        if (error instanceof CustomError) {
          cb(error);
        } else {
          logger.error('Error in Google authentication:', error);
          cb(error);
        }
      }
    },
  ),
);

// github
passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      callbackURL: '/api/v1/users/github/callback',
      scope: ['profile', 'email'],
    },
    async function (accessToken: string, refreshToken: string, profile: Profile, cb: DoneCallback) {
      try {
        const { accessToken, refreshToken } = await loginWithAuthProviders({
          provider: 'google',
          providerId: profile.id,
          email: profile.emails?.[0].value,
          username: profile.displayName,
          avatar: profile.photos?.[0].value,
        });
        const user = { accessToken, refreshToken };
        cb(null, user);
      } catch (error) {
        if (error instanceof CustomError) {
          cb(error);
        } else {
          logger.error('Error in Google authentication:', error);
          cb(error);
        }
      }
    },
  ),
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user: Express.User, cb) => {
  cb(null, user);
});
