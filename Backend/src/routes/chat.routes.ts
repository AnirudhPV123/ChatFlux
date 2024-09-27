import {
  addUserToGroup,
  createAGroupChat,
  createAOneOnOneChat,
  deleteChat,
  deleteGroup,
  getAllChats,
  getCalls,
  groupMembersDetails,
  leaveGroup,
  removeUserFromGroup,
} from '@/controllers/chat.controller';
import { verifyJWT } from '@/middlewares/auth.middleware';
import { Router } from 'express';
const router = Router();

router.route('/').get(verifyJWT, getAllChats);

router.route('/c/:id').post(verifyJWT, createAOneOnOneChat);
router.route('/delete/:id/:userId').delete(verifyJWT, deleteChat);

router.route('/group').post(verifyJWT, createAGroupChat);
router.route('/group-members-details/:id').get(verifyJWT, groupMembersDetails);
router.route('/add-user-to-group/:groupId/:userId').put(verifyJWT, addUserToGroup);
router.route('/delete-group/:id').delete(verifyJWT, deleteGroup);
router.route('/leave-group/:id').put(verifyJWT, leaveGroup);
router.route('/remove-user-from-group/:groupId/:userId').put(verifyJWT, removeUserFromGroup);

router.route('/calls').get(verifyJWT, getCalls);
export default router;
