import { createAGroupChat, createAOneOnOneChat } from '@/controllers/chat.controller';
import { verifyJWT } from '@/middlewares/auth.middleware';
import { Router } from 'express';
const router = Router();

// create one on one chat
router.route('/c/:id').post(verifyJWT, createAOneOnOneChat);

// create a group chat
router.route('/group').post(verifyJWT, createAGroupChat);

export default router;
