import { Router } from 'express';
import { getGroupMessage, getMessage, sendGroupMessage, sendMessage } from '../controllers/message.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// get message
router.route('/:id').get(verifyJWT, getMessage);

// send message
router.route('/send/:id').post(verifyJWT, sendMessage);

router.route('/send-group/:id').post(verifyJWT, sendGroupMessage);

router.route('/group/:id').get(verifyJWT, getGroupMessage);



export default router;
