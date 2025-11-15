import { Router } from 'express';
import { healthCheck, postChatMessage, postChatImage } from '../controllers/chatController';
import { sendEmailHandler } from '../controllers/emailController';

const router: Router = Router();

router.get('/health', healthCheck);
router.post('/chat', postChatMessage);
router.post('/chat/image', postChatImage);
router.post('/email/send', sendEmailHandler);

export default router;

