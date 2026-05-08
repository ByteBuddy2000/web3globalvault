import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
  console.warn("SMTP credentials are not fully configured. Forgot password emails will not be sent.");
}

const transporter = nodemailer.createTransport({
  host: smtpHost,
  port: smtpPort,
  secure: smtpPort === 465,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

export async function sendEmail(options: EmailOptions) {
  if (!smtpHost || !smtpPort || !smtpUser || !smtpPass) {
    console.warn("sendEmail skipped because SMTP env vars are missing");
    return;
  }

  const mailOptions = {
    from: process.env.SMTP_FROM || `"Genesis Bank" <${smtpUser}>`,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
}
