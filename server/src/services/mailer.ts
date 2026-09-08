import nodemailer, { type Transporter } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export interface MailMessage {
  to: string[];
  subject: string;
  html: string;
  text: string;
}

const DEFAULT_MAIL_FROM = 'KFG NETWORK <network@kfg.co.il>';

let transporter: Transporter | null = null;

const smtpHost = () => process.env.SMTP_HOST?.trim() || '';

const smtpPort = () => Number(process.env.SMTP_PORT) || 587;

const mailFrom = () => process.env.MAIL_FROM?.trim() || DEFAULT_MAIL_FROM;

export const isMailConfigured = (): boolean => Boolean(smtpHost());

const getTransporter = (): Transporter => {
  if (transporter) return transporter;
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASSWORD;
  const port = smtpPort();
  transporter = nodemailer.createTransport({
    host: smtpHost(),
    port,
    secure: process.env.SMTP_SECURE === 'true' || port === 465,
    auth: user ? { user, pass } : undefined,
  });
  return transporter;
};

export const sendMail = async ({ to, subject, html, text }: MailMessage): Promise<boolean> => {
  if (!isMailConfigured()) {
    console.warn(`✗ Email not configured (SMTP_HOST) — skipped "${subject}"`);
    return false;
  }
  if (to.length === 0) {
    console.warn(`✗ No recipients — skipped "${subject}"`);
    return false;
  }
  await getTransporter().sendMail({ from: mailFrom(), to: to.join(', '), subject, html, text });
  return true;
};
