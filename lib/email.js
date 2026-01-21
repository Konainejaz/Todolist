import nodemailer from 'nodemailer';

export async function sendEmail({ to, subject, text, html }) {
  let transporter;
  
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SMTP is not configured');
    }
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, 
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  const fromEmail = process.env.EMAIL_FROM || 'noreply@taskmaster.com';

  const info = await transporter.sendMail({
    from: `"TaskMaster Support" <${fromEmail}>`,
    to,
    subject,
    text,
    html,
  });

  if (info.host === "smtp.ethereal.email" || transporter.options.host === "smtp.ethereal.email") {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`[EMAIL] Preview URL: ${previewUrl}`);
    return { previewUrl };
  }

  console.log(`[EMAIL] Email sent: ${info.messageId}`);
  return { messageId: info.messageId };
}
