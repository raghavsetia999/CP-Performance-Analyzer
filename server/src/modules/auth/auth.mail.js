import nodemailer from 'nodemailer'
import { env } from '../../config/env.js'

export function isPasswordEmailConfigured() {
  return Boolean(env.SMTP_HOST)
}

export async function sendPasswordResetEmail({ name, resetUrl, to }) {
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_SECURE,
    ...(env.SMTP_USER && env.SMTP_PASS
      ? { auth: { user: env.SMTP_USER, pass: env.SMTP_PASS } }
      : {}),
  })

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to,
    subject: 'Reset your CP Pulse password',
    text: `Hi ${name},\n\nReset your CP Pulse password using this link: ${resetUrl}\n\nThis link expires in ${env.PASSWORD_RESET_EXPIRES_MINUTES} minutes. If you did not request it, you can ignore this email.`,
  })
}
