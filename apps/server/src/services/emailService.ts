import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export interface EmailPayload {
  to: string;
  subject: string;
  text: string;
}

export async function sendEmail({
  to,
  subject,
  text,
}: EmailPayload): Promise<string> {
  console.log('[Email] sendEmail called', { to, subject, textLength: text.length });
  
  if (!resend) {
    console.error('[Email] RESEND_API_KEY not configured');
    throw new Error('RESEND_API_KEY not configured');
  }

  const fromEmail =
    process.env.RESEND_FROM_EMAIL ||
    (process.env.NODE_ENV !== 'production' ? 'onboarding@resend.dev' : '');

  console.log('[Email] From email:', fromEmail, 'NODE_ENV:', process.env.NODE_ENV);

  if (!fromEmail) {
    console.error('[Email] RESEND_FROM_EMAIL not configured');
    throw new Error('RESEND_FROM_EMAIL not configured');
  }

  if (!to || !subject || !text) {
    console.error('[Email] Missing required fields', { to: !!to, subject: !!subject, text: !!text });
    throw new Error('All fields are required');
  }

  console.log('[Email] Sending via Resend', { to, subject, from: fromEmail, textLength: text.length });

  const { data, error } = await resend.emails.send(
    {
      from: fromEmail,
      to,
      subject,
      text,
    },
    {
      headers: {
        'x-powered-by': 'jaglak-server',
      },
    },
  );

  if (error) {
    console.error('[Email] Resend API error', error);
    throw new Error(error.message ?? 'Failed to send email');
  }

  const messageId = data?.id ?? 'sent';
  console.log('[Email] Resend delivered message', messageId);
  return messageId;
}

