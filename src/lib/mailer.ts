// src/lib/mailer.ts
import "server-only";
import nodemailer from "nodemailer";

type MailerEnv = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
};

function mustEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

function getMailerEnv(): MailerEnv {
  return {
    host: mustEnv("MAIL_HOST"),
    port: Number(mustEnv("MAIL_PORT")),
    secure: mustEnv("MAIL_SECURE") === "true",
    user: mustEnv("MAIL_USER"),
    pass: mustEnv("MAIL_PASS"),
    fromName: mustEnv("MAIL_FROM_NAME"),
    fromEmail: mustEnv("MAIL_FROM_EMAIL"),
  };
}

function createTransport() {
  const e = getMailerEnv();
  return nodemailer.createTransport({
    host: e.host,
    port: e.port,
    secure: e.secure,
    auth: { user: e.user, pass: e.pass },
  });
}

export type SendMailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

export async function sendMail(input: SendMailInput): Promise<void> {
  const e = getMailerEnv();
  const transporter = createTransport();

  await transporter.sendMail({
    from: `"${e.fromName}" <${e.fromEmail}>`,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
}