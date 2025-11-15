import { Request, Response } from 'express';
import { sendEmail } from '../services/emailService';

export const sendEmailHandler = async (req: Request, res: Response) => {
  try {
    const { to, subject, text } = req.body;
    const messageId = await sendEmail({ to, subject, text });

    res.json({
      success: true,
      messageId,
    });
  } catch (error) {
    console.error('Email send error:', error);
    const message = error instanceof Error ? error.message : 'Failed to send email';
    const status = message.includes('required') || message.includes('configured') ? 400 : 500;
    res.status(status).json({ error: message });
  }
};

