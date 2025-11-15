import { Request, Response } from 'express';
import { transcribeAudio } from '../services/whisperService';

export const postTranscribeAudio = async (req: Request, res: Response) => {
  console.log('[API] POST /api/whisper/transcribe - Received transcription request');
  try {
    // Check if request has file upload
    if (!req.body.audio) {
      return res.status(400).json({ error: 'Audio data is required' });
    }

    // Audio should be base64 encoded
    let audioBuffer: Buffer;
    try {
      // Remove data URL prefix if present
      const base64Data = req.body.audio.replace(/^data:audio\/[^;]+;base64,/, '');
      audioBuffer = Buffer.from(base64Data, 'base64');
    } catch (error) {
      console.error('[API] POST /api/whisper/transcribe - Error decoding base64:', error);
      return res.status(400).json({ error: 'Invalid audio data format' });
    }

    if (audioBuffer.length === 0) {
      return res.status(400).json({ error: 'Audio buffer is empty' });
    }

    console.log('[API] POST /api/whisper/transcribe - Audio buffer size:', audioBuffer.length, 'bytes');
    console.log('[API] POST /api/whisper/transcribe - Calling transcribeAudio');
    
    const result = await transcribeAudio({
      audioBuffer,
      language: req.body.language,
      prompt: req.body.prompt,
      responseFormat: req.body.responseFormat || 'text',
    });

    console.log('[API] POST /api/whisper/transcribe - Transcription complete, transcription length:', result.transcription.length);
    console.log('[API] POST /api/whisper/transcribe - AI response length:', result.aiResponse.length);
    res.json({ 
      transcription: result.transcription,
      aiResponse: result.aiResponse,
    });
  } catch (error) {
    console.error('[API] POST /api/whisper/transcribe - Error:', error);
    const status = error instanceof Error && error.message.includes('required') ? 400 : 500;
    const message = error instanceof Error ? error.message : 'Failed to transcribe audio';
    res.status(status).json({ error: message });
  }
};

