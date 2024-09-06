import { Router } from 'express';
import { forgotPasswordGenerateOtp, forgotPasswordVerifyOtp, login, resetPassword, signUpGenerateOtp, signUpVerifyOtp } from '../controllers/user.controller';

const router = Router();

router.route('/login').post(login);
router.route('/signup').post(signUpGenerateOtp);
router.route('/signup/verify-otp').post(signUpVerifyOtp);
router.route('/forgot-password').post(forgotPasswordGenerateOtp);
router.route('/forgot-password/verify-otp').post(forgotPasswordVerifyOtp);
router.route('/forgot-password/reset').post(resetPassword)

export default router;
