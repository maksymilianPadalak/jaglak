import { Router } from 'express';
import { healthCheck, postChatMessage, postChatImage } from '../controllers/chatController';
import { sendEmailHandler } from '../controllers/emailController';
import { postTextToSpeech, getVoicesList } from '../controllers/elevenLabsController';
import { postTranscribeAudio } from '../controllers/whisperController';

const router: Router = Router();

router.get('/health', healthCheck);
router.post('/chat', postChatMessage);
router.post('/chat/image', postChatImage);
router.post('/email/send', sendEmailHandler);
router.post('/elevenlabs/tts', postTextToSpeech);
router.get('/elevenlabs/voices', getVoicesList);
router.post('/whisper/transcribe', postTranscribeAudio);

export default router;

