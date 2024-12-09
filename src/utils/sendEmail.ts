const nodemailer = require("nodemailer");

const AUTH_EMAIL = Bun.env.AUTH_EMAIL!;
const AUTH_PASS = Bun.env.AUTH_PASS!;


const transporter = nodemailer.createTransport({
  host: 'mx2.hosting.reg.ru.',
  port: 465,
  secure: true,
  auth: {
      user: 'musco.store@musco.store',
      pass: 'Mus056056'
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Ready for messages");
    console.log(success);
  }
});
export const sendEmail = async (mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
    return;
  } catch (error) {}
};
