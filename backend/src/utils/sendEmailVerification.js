import nodemailer from 'nodemailer';

async function sendEmailVerification(email, otp) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"SneakEase" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your Email Address',
    html: `
    <p>Dear User,</p>
    <p>Thank you for signing up with SneakEase.</p>
    <p>Your One-Time Password (OTP) for email verification is:</p>
    <h3>${otp}</h3>
    <p>Please enter this OTP on the verification page to complete your registration. This OTP is valid for 5 minutes.</p>
    <p>If you didn't request this OTP, please ignore this email. Your account's security is important to us.</p>
    <p>Best regards,</p>
    <p>The SneakEase Team</p>
  `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    return;
  }
}

export default sendEmailVerification;
