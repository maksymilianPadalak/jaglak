import { Request, Response } from 'express';
import { generateChatResponse } from '../services/chatService';

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

