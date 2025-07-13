const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOpts = {
    from: "realEstate app <eng.bashar75@gmail.com>",
    to: options.email,
    subject: options.subject,
    html: options.html || undefined,
  };
  await transporter.sendMail(mailOpts);
};
module.exports = sendEmail;
