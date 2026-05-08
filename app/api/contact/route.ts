import { NextRequest, NextResponse } from 'next/server';
import { sendEmail } from '@/lib/mailer';

export async function POST(request: NextRequest) {
  try {
    const { name, email, department, subject, message } = await request.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Send email to support
    await sendEmail({
      to: 'support@genesisbank.com',
      subject: `Contact Form: ${subject}`,
      text: `
Name: ${name}
Email: ${email}
Department: ${department || 'Not specified'}
Subject: ${subject}

Message:
${message}
      `,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Department:</strong> ${department || 'Not specified'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    // Optionally send confirmation to user
    try {
      await sendEmail({
        to: email,
        subject: 'Thank you for contacting Genesis Bank',
        text: `Hi ${name},\n\nThank you for reaching out to us. We have received your message and will get back to you within 2 hours.\n\nBest regards,\nGenesis Bank Support Team`,
        html: `
          <p>Hi ${name},</p>
          <p>Thank you for reaching out to us. We have received your message and will get back to you within 2 hours.</p>
          <p>Best regards,<br>Genesis Bank Support Team</p>
        `,
      });
    } catch (confirmationError) {
      console.warn('Failed to send confirmation email:', confirmationError);
      // Don't fail the request if confirmation fails
    }

    return NextResponse.json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}