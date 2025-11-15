import { Request, Response } from 'express';
import { textToSpeech, getVoices } from '../services/elevenLabsService';

export const postTextToSpeech = async (req: Request, res: Response) => {
  console.log('[API] POST /api/elevenlabs/tts - Received text-to-speech request');
  try {
    const { voiceId, text, modelId, outputFormat } = req.body;

    if (!voiceId) {
      return res.status(400).json({ error: 'Voice ID is required' });
    }

    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    console.log('[API] POST /api/elevenlabs/tts - Calling textToSpeech');
    const audioBuffer = await textToSpeech({
      voiceId,
      text,
      modelId,
      outputFormat,
    });

    console.log('[API] POST /api/elevenlabs/tts - Audio generated, size:', audioBuffer.length, 'bytes');

    // Set appropriate headers for audio response
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.length);
    res.send(audioBuffer);
  } catch (error) {
    console.error('[API] POST /api/elevenlabs/tts - Error:', error);
    const status = error instanceof Error && error.message.includes('required') ? 400 : 500;
    const message = error instanceof Error ? error.message : 'Failed to generate speech';
    res.status(status).json({ error: message });
  }
};

export const getVoicesList = async (_req: Request, res: Response) => {
  console.log('[API] GET /api/elevenlabs/voices - Fetching voices list');
  try {
    const voices = await getVoices();
    const voicesArray = Array.isArray(voices) ? voices : (voices as any).voices || [];
    console.log('[API] GET /api/elevenlabs/voices - Voices fetched:', voicesArray.length);
    res.json({ voices: voicesArray });
  } catch (error) {
    console.error('[API] GET /api/elevenlabs/voices - Error:', error);
    const status = error instanceof Error && error.message.includes('not configured') ? 503 : 500;
    const message = error instanceof Error ? error.message : 'Failed to fetch voices';
    res.status(status).json({ error: message });
  }
};

