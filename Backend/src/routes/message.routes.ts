import { deleteMessage, getGroupMessage, getMessage, sendGroupMessage, sendMessage } from '@/controllers/message.controller';
import { verifyJWT } from '@/middlewares/auth.middleware';
import { upload } from '@/middlewares/multer.middlewares';
import { Router } from 'express';
const router = Router();

router.route('/send/:id').post(verifyJWT, upload, sendMessage);

router.route('/send-group/:id').post(verifyJWT, upload, sendGroupMessage);

router.route('/:id').get(verifyJWT, getMessage);

router.route('/group/:id').get(verifyJWT, getGroupMessage);

router.route('/delete-message/:messageId/:id').put(verifyJWT, deleteMessage);



export default router;
