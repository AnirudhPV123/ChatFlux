import { Router } from 'express';
import { login, signUp } from '../controllers/user.controller';

const router = Router();

router.route('/login').post(login);
router.route('/signup').post(signUp);

export default router;
