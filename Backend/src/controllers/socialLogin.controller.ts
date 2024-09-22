import passport from 'passport';
import { handleAuthCallback } from '@/utils';

const googleLogin = passport.authenticate('google', { scope: ['profile', 'email'] });
const googleLoginCallback = handleAuthCallback('google');

const githubLogin = passport.authenticate('github', { scope: ['profile', 'email'] });
const githubLoginCallback = handleAuthCallback('github');

export { googleLogin, googleLoginCallback, githubLogin, githubLoginCallback };
