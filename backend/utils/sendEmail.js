const nodemailer = require('nodemailer');

// Sends an email notification. Silently logs (instead of throwing) if SMTP
// isn't configured yet, so the rest of the app keeps working in dev.
const sendEmail = async ({ to, subject, html, text }) => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log(`✉️  [Email skipped - SMTP not configured] To: ${to} | Subject: ${subject}`);
    return { skipped: true };
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });

  return info;
};

module.exports = sendEmail;
