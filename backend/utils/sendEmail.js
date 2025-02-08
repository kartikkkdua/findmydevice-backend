const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const sendEmail = async (to, subject, text, html) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST, // Use your email provider's SMTP
      port: process.env.SMTP_PORT,
      secure: false, // Set to true for 465 (SSL), false for 587 (TLS)
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Live Location Tracker" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`📩 Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ Email error:", error);
  }
};

module.exports = sendEmail;