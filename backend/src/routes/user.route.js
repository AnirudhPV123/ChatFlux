import { Router } from 'express';
import {
  forgotPassword,
  loginUser,
  refreshAccessAndRefreshToken,
  resendOTP,
  resetPassword,
  registerUser,
  verifyOTP,
  getUserProfile,
  logoutUser,
  getAvailableUsers,
} from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// signup with either email or phone number route
router.route('/register').post(registerUser);

// OTP verify with phone number route
router.route('/verify').post(verifyOTP);

// OTP resend
router.route('/resend-otp').post(resendOTP);

// forgot password
router.route('/forgot-password').post(forgotPassword);

// reset password
router.route('/reset-password').post(resetPassword);

// user login
router.route('/login').post(loginUser);

// refresh access and refresh token
router.route('/refresh-token').post(refreshAccessAndRefreshToken);

// get profile
router.route('/profile').get(verifyJWT, getUserProfile);

// user logout
router.route('/logout').get(logoutUser);

// get available users
router.route('/users').get(verifyJWT, getAvailableUsers);

export default router;
