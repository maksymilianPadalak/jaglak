import { Request, Response } from 'express';
import { generateChatResponse, analyzeImage } from '../services/chatService';

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
    console.log('[API] POST /api/chat/image - Analysis complete:', {
      description: analysisResult.description?.substring(0, 100),
      action: analysisResult.action,
    });

    res.json(analysisResult);
  } catch (error) {
    console.error('[API] POST /api/chat/image - Image analysis error:', error);
    const status = error instanceof Error && error.message.includes('required') ? 400 : 500;
    const message = error instanceof Error ? error.message : 'Failed to analyze image';
    res.status(status).json({ error: message });
  }
};

