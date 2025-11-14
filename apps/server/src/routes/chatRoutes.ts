import { Router } from 'express';
import { healthCheck, postChatMessage } from '../controllers/chatController';

const router: Router = Router();

router.get('/health', healthCheck);
router.post('/chat', postChatMessage);

export default router;

