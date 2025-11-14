import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

export async function generateChatResponse(message: string): Promise<string> {
  if (!openai) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  if (!message || typeof message !== 'string') {
    throw new Error('Message is required');
  }

  const completion = await openai.chat.completions.create({
    model: 'gpt-5.1-mini',
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant. Respond concisely and clearly.',
      },
      {
        role: 'user',
        content: message,
      },
    ],
    max_tokens: 150,
    temperature: 0.7,
  } as OpenAI.ChatCompletionCreateParamsNonStreaming);

  return completion.choices[0]?.message?.content ?? '';
}

export async function analyzeImage(imageBase64: string): Promise<string> {
  if (!openai) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  if (!imageBase64) {
    throw new Error('Image data is required');
  }

  // Remove data URL prefix if present
  const base64Data = imageBase64.replace(/^data:image\/[^;]+;base64,/, '');

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Tell me what you see in this image.',
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${base64Data}`,
            },
          },
        ],
      },
    ],
    max_tokens: 300,
  });

  return completion.choices[0]?.message?.content ?? '';
}

