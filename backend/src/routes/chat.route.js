import { Router } from 'express';
import {
  addUserToGroup,
  // blockChat,
  createAGroupChat,
  createAOneOnOneChat,
  deleteChat,
  deleteGroup,
  getAllChats,
  groupMembersDetails,
  leaveGroup,
  removeUserFromGroup,
} from '../controllers/chat.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// get all chats
router.route('/').get(verifyJWT, getAllChats);

// create one on one chat
router.route('/c/:id').post(verifyJWT, createAOneOnOneChat);

// create a group chat
router.route('/group').post(verifyJWT, createAGroupChat);


// delete chat
router.route('/delete/:id').delete(verifyJWT, deleteChat);

// router.route('/block/:id').put(verifyJWT, blockChat);

router.route('/leave-group/:id').put(verifyJWT, leaveGroup);

router.route('/delete-group/:id').delete(verifyJWT, deleteGroup);

router.route('/group-members-details/:id').get(verifyJWT, groupMembersDetails);

router.route('/remove-user-from-group/:groupId/:userId').put(verifyJWT, removeUserFromGroup);


router.route('/add-user-to-group/:groupId/:userId').put(verifyJWT, addUserToGroup);



export default router;
