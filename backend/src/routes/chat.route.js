import { Router } from 'express';
import {
  createAGroupChat,
  createAOneOnOneChat,
  getAllChats,
} from '../controllers/chat.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// get all chats
router.route('/').get(verifyJWT, getAllChats);

// create one on one chat
router.route('/c/:id').post(verifyJWT, createAOneOnOneChat);

// create a group chat
router.route('/group').post(verifyJWT, createAGroupChat);

export default router;
