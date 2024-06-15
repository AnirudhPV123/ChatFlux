import { Router } from 'express';
import {
  deleteMessage,
  getGroupMessage,
  getMessage,
  sendGroupMessage,
  sendMessage,
} from '../controllers/message.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middlewares.js';
// import { upload } from '../middlewares/multer.middlewares.js';

const router = Router();

// get message
router.route('/:id').get(verifyJWT, getMessage);

// send message
router.route('/send/:id').post(verifyJWT, upload, sendMessage);

router.route('/send-group/:id').post(verifyJWT,upload, sendGroupMessage);

router.route('/group/:id').get(verifyJWT, getGroupMessage);

router.route('/delete-message/:messageId/:id').put(verifyJWT, deleteMessage);



export default router;
