import OpenAI from 'openai';
import { z } from 'zod';

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

// Zod schema for image analysis result
const ImageAnalysisSchema = z.object({
  description: z.string().describe('Description of what is seen in the image'),
  action: z.enum(['pickUp', 'talkTo', 'noAction']).describe('The action to take based on the image'),
});

export type ImageAnalysisResult = z.infer<typeof ImageAnalysisSchema>;

export async function analyzeImage(imageBase64: string): Promise<ImageAnalysisResult> {
  if (!openai) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  if (!imageBase64) {
    throw new Error('Image data is required');
  }

  // Remove data URL prefix if present
  const base64Data = imageBase64.replace(/^data:image\/[^;]+;base64,/, '');

  try {
    // Use Responses API with image support
    // Input format: array with role and content, where content contains input_text and input_image
    const imageDataUrl = `data:image/jpeg;base64,${base64Data}`;
    
    const response = await openai.responses.create({
      model: 'gpt-4o-mini',
      instructions: 'You are elder lonely person assistant robot. Based on image provided you make action if you need to do something. If you decide no action is needed return noAction. You MUST return ONLY valid JSON with "description" (string) and "action" (one of: "pickUp", "talkTo", "noAction"), no other text.',
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: 'Analyze this image and determine what action should be taken. Return ONLY a valid JSON object with "description" (string describing what you see) and "action" (one of: "pickUp", "talkTo", or "noAction").',
            },
            {
              type: 'input_image',
              image_url: imageDataUrl,
              detail: 'high',
            },
          ],
        },
      ],
      max_output_tokens: 300,
    });

    // Parse the output_text as JSON and validate with Zod schema
    const outputText = response.output_text;
    if (!outputText) {
      throw new Error('No output text received from Responses API');
    }

    try {
      // Try to parse as JSON directly
      const parsed = JSON.parse(outputText.trim());
      // Validate with Zod schema
      return ImageAnalysisSchema.parse(parsed);
    } catch (parseError) {
      console.error('[ChatService] Failed to parse response:', parseError);
      // Try to extract JSON from the text if it's wrapped in markdown or other text
      const jsonMatch = outputText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          const parsed = JSON.parse(jsonMatch[0]);
          return ImageAnalysisSchema.parse(parsed);
        } catch (e) {
          console.error('[ChatService] Failed to parse extracted JSON:', e);
        }
      }
      throw new Error(`Failed to parse structured response from API: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
  } catch (error) {
    console.error('[ChatService] Error analyzing image:', error);
    if (error instanceof Error) {
      if (error.message.includes('length') || error.message.includes('truncated')) {
        return {
          description: 'Response was too long',
          action: 'noAction',
        };
      }
      if (error.message.includes('content filter') || error.message.includes('filtered')) {
        return {
          description: 'Content was filtered',
          action: 'noAction',
        };
      }
      // If Zod validation fails, return error
      if (error.message.includes('validation') || error.message.includes('parse')) {
        return {
          description: `Validation error: ${error.message}`,
          action: 'noAction',
        };
      }
    }
    throw error;
  }
}

