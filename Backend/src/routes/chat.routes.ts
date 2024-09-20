import {
  addUserToGroup,
  createAGroupChat,
  createAOneOnOneChat,
  deleteChat,
  deleteGroup,
  getAllChats,
  groupMembersDetails,
  leaveGroup,
  removeUserFromGroup,
} from '@/controllers/chat.controller';
import { verifyJWT } from '@/middlewares/auth.middleware';
import { Router } from 'express';
const router = Router();

// create one on one chat
router.route('/c/:id').post(verifyJWT, createAOneOnOneChat);

// create a group chat
router.route('/group').post(verifyJWT, createAGroupChat);

router.route('/').get(verifyJWT, getAllChats);

router.route('/group-members-details/:id').get(verifyJWT, groupMembersDetails);

// delete chat
// router.route('/delete/:id').delete(verifyJWT, deleteChat);
router.route('/delete/:id/:userId').delete(verifyJWT, deleteChat);


router.route('/add-user-to-group/:groupId/:userId').put(verifyJWT, addUserToGroup);

router.route('/delete-group/:id').delete(verifyJWT, deleteGroup);

router.route('/leave-group/:id').put(verifyJWT, leaveGroup);

router.route('/remove-user-from-group/:groupId/:userId').put(verifyJWT, removeUserFromGroup);

export default router;
