import { Request, Response } from 'express';
import { sendEmail } from '../services/emailService';

export const sendEmailHandler = async (req: Request, res: Response) => {
  console.log('[API] POST /api/email/send - Received email request', { 
    to: req.body.to, 
    subject: req.body.subject,
    textLength: req.body.text?.length || 0 
  });
  try {
    const { to, subject, text } = req.body;
    console.log('[API] POST /api/email/send - Calling sendEmail service');
    const messageId = await sendEmail({ to, subject, text });
    console.log('[API] POST /api/email/send - Email sent successfully, messageId:', messageId);

    res.json({
      success: true,
      messageId,
    });
  } catch (error) {
    console.error('[API] POST /api/email/send - Email send error:', error);
    const message = error instanceof Error ? error.message : 'Failed to send email';
    const status = message.includes('required') || message.includes('configured') ? 400 : 500;
    res.status(status).json({ error: message });
  }
};

