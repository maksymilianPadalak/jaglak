import { Request, Response } from 'express';
import { generateChatResponse } from '../services/chatService';

export const healthCheck = (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
};

export const postChatMessage = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const response = await generateChatResponse(message);
    res.json({ response });
  } catch (error) {
    console.error('OpenAI API error:', error);
    const status = error instanceof Error && error.message === 'Message is required' ? 400 : 500;
    const message = error instanceof Error ? error.message : 'Failed to get AI response';
    res.status(status).json({ error: message });
  }
};

