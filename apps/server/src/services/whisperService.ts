import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import os from 'os';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export interface TranscriptionOptions {
  audioBuffer: Buffer;
  language?: string;
  prompt?: string;
  responseFormat?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
}

export interface TranscriptionResult {
  transcription: string;
  aiResponse: string;
}

export async function transcribeAudio(options: TranscriptionOptions): Promise<TranscriptionResult> {
  if (!openai) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  if (!options.audioBuffer || options.audioBuffer.length === 0) {
    throw new Error('Audio buffer is required');
  }

  try {
    // Create a temporary file for the audio
    const tempDir = os.tmpdir();
    const tempFilePath = path.join(tempDir, `audio_${Date.now()}.mp3`);
    
    // Write buffer to temp file
    fs.writeFileSync(tempFilePath, options.audioBuffer);

    try {
      // Create a ReadStream for OpenAI API
      const fileStream = fs.createReadStream(tempFilePath);
      
      // OpenAI SDK accepts ReadStream directly
      const transcription = await openai.audio.transcriptions.create({
        file: fileStream,
        model: 'whisper-1',
        language: options.language,
        prompt: options.prompt,
        response_format: options.responseFormat || 'text',
      });

      const transcriptionText = typeof transcription === 'string' ? transcription : transcription.text || JSON.stringify(transcription);
      
      // Send transcription to OpenAI using Responses API to generate a response
      console.log('[Whisper] Transcription complete, sending to OpenAI for response generation');
      const response = await openai.responses.create({
        model: 'gpt-4o-mini',
        instructions: 'You are a helpful assistant. Respond concisely and clearly.',
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: transcriptionText,
              },
            ],
          },
        ],
        max_output_tokens: 150,
      });

      const aiResponse = response.output_text || '';

      return {
        transcription: transcriptionText,
        aiResponse: aiResponse,
      };
    } finally {
      // Clean up temp file
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
  } catch (error) {
    console.error('[Whisper] Error transcribing audio:', error);
    throw error;
  }
}

