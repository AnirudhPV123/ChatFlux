import { createAGroupChat, createAOneOnOneChat, getAllChats } from '@/controllers/chat.controller';
import { verifyJWT } from '@/middlewares/auth.middleware';
import { Router } from 'express';
const router = Router();

// create one on one chat
router.route('/c/:id').post(verifyJWT, createAOneOnOneChat);

// create a group chat
router.route('/group').post(verifyJWT, createAGroupChat);

router.route('/').get(verifyJWT, getAllChats);
export default router;
