import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const elevenlabs = process.env.ELEVENLABS_API_KEY
  ? new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    })
  : null;

export interface TextToSpeechOptions {
  voiceId: string;
  text: string;
  modelId?: string;
  outputFormat?: string;
}

export async function textToSpeech(
  options: TextToSpeechOptions,
  onChunk?: (chunk: Buffer) => void
): Promise<Buffer> {
  if (!elevenlabs) {
    throw new Error('ELEVENLABS_API_KEY not configured');
  }

  if (!options.text || typeof options.text !== 'string') {
    throw new Error('Text is required');
  }

  if (!options.voiceId || typeof options.voiceId !== 'string') {
    throw new Error('Voice ID is required');
  }

  try {
    const audio = await elevenlabs.textToSpeech.convert(options.voiceId, {
      text: options.text,
      modelId: options.modelId || 'eleven_multilingual_v2',
      outputFormat: (options.outputFormat || 'mp3_44100_128') as any,
    });

    // Convert the audio stream to Buffer
    const chunks: Uint8Array[] = [];
    const reader = audio.getReader();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        chunks.push(value);
        // Call onChunk callback if provided to stream audio chunks immediately
        if (onChunk) {
          onChunk(Buffer.from(value));
        }
      }
    }

    return Buffer.concat(chunks);
  } catch (error) {
    console.error('[ElevenLabs] Error converting text to speech:', error);
    throw error;
  }
}

export async function getVoices() {
  if (!elevenlabs) {
    throw new Error('ELEVENLABS_API_KEY not configured');
  }

  try {
    const voices = await elevenlabs.voices.getAll();
    return voices;
  } catch (error) {
    console.error('[ElevenLabs] Error fetching voices:', error);
    throw error;
  }
}

