import { ImapFlow } from "imapflow";
import nodemailer from "nodemailer";
import { simpleParser } from "mailparser";

export interface EmailMessage {
  from: string;
  subject: string;
  text: string;
}

export async function getLastUnreadEmail(): Promise<EmailMessage | null> {
  const client = new ImapFlow({
    host: process.env.IMAP_HOST,
    port: Number(process.env.IMAP_PORT || 993),
    secure: true,
    auth: {
      user: process.env.EMAIL_USER as string,
      pass: process.env.EMAIL_PASS as string
    }
  });

  await client.connect();

  try {
    const lock = await client.getMailboxLock("INBOX");
    try {
      const searchResult = await client.search({ seen: false });
      if (!searchResult.length) {
        return null;
      }
      const latestSeq = searchResult[searchResult.length - 1];
      const message = await client.fetchOne(latestSeq, { source: true });

      if (!message?.source) return null;

      const parsed = await simpleParser(message.source);

      return {
        from: parsed.from?.text || "",
        subject: parsed.subject || "",
        text: parsed.text || parsed.html || ""
      };
    } finally {
      lock.release();
    }
  } finally {
    await client.logout();
  }
}

export async function sendEmail(to: string, subject: string, text: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER as string,
      pass: process.env.EMAIL_PASS as string
    }
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    to,
    subject,
    text
  });
}

