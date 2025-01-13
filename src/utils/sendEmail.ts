const nodemailer = require("nodemailer");

const AUTH_EMAIL = Bun.env.AUTH_EMAIL!;
const AUTH_PASS = Bun.env.AUTH_PASS!;


const transporter = nodemailer.createTransport({
  host: 'mail.hosting.reg.ru',
  port: 465,
  secure: true,
  pool: true,
  auth: {
      user: Bun.env.AUTH_EMAIL,
      pass: Bun.env.AUTH_PASS
  },
  tls: {
    rejectUnauthorized: true,
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
// const mailOptionss = {
//   from: 'musco@mail.musandco.ru', 
//   to: "bobylev.e@inbox.ru",
//   subject:"11111",
//   text:"111111"
// };
export const sendEmail = async (mailOptions) => {
  try {
    await transporter.sendMail(mailOptions);
    return;
  } catch (error) {}
};
