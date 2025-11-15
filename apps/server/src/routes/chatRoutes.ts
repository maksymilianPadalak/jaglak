import { Router } from 'express';
import { healthCheck, postChatMessage, postChatImage } from '../controllers/chatController';
import { sendEmailHandler } from '../controllers/emailController';
import { postTextToSpeech, getVoicesList } from '../controllers/elevenLabsController';
import { postTranscribeAudio } from '../controllers/whisperController';
import { createTask, getTasks, updateTask } from '../controllers/taskController';
import { getCreditCards } from '../controllers/creditCardController';

const router: Router = Router();

router.get('/health', healthCheck);
router.post('/chat', postChatMessage);
router.post('/chat/image', postChatImage);
router.post('/email/send', sendEmailHandler);
router.post('/elevenlabs/tts', postTextToSpeech);
router.get('/elevenlabs/voices', getVoicesList);
router.post('/whisper/transcribe', postTranscribeAudio);
router.post('/tasks', createTask);
router.get('/tasks', getTasks);
router.patch('/tasks/:id', updateTask);
router.get('/credit-cards', getCreditCards);

export default router;

