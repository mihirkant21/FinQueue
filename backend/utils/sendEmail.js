const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  console.log(options)
  try {
    if (process.env.EMAIL_USER === 'your_mailtrap_user' || !process.env.EMAIL_USER) {
      console.log(`[MOCK EMAIL] To: ${options.email} | Subject: ${options.subject}`);
      console.log(`[MOCK EMAIL] Message: ${options.message}`);
      return;
    }

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    console.log(transporter);

    const mailOptions = {
      from: '"Digital Queue System" <noreply@queuesystem.com>',
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendEmail;
