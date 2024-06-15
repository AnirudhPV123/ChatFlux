import { Router } from 'express';
import {
  // blockChat,
  createAGroupChat,
  createAOneOnOneChat,
  deleteChat,
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

router.route('/delete/:id').delete(verifyJWT, deleteChat);

// router.route('/block/:id').put(verifyJWT, blockChat);



export default router;
