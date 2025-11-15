import { Router } from 'express';
import { healthCheck, postChatMessage } from '../controllers/chatController';
import { sendEmailHandler } from '../controllers/emailController';

const router: Router = Router();

router.get('/health', healthCheck);
router.post('/chat', postChatMessage);
router.post('/email/send', sendEmailHandler);

export default router;

