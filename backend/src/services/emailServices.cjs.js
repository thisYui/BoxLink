const sgMail = require('@sendgrid/mail');
const { db } = require("../config/firebaseConfig.cjs");
const bcrypt = require('bcrypt');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Middleware để kiểm tra xem người dùng tồn tại
async function checkEmailExists(email) {
    try {
        const snapshot = await db.collection("users")
            .where("email", "==", email)
            .get();

        return !snapshot.empty; // Trả về true nếu có ít nhất 1 user khớp
    } catch (error) {
        console.error("Lỗi khi kiểm tra email:", error);
        return false;
    }
}

// Hàm gửi email
function sendOTP(to, subject, text, salt) {
    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 số
    console.log(otp)
        const msg = {
          to: 'nguyenquangduy048@gmail.com',        // Người nhận
          from: process.env.SENDGRID_SERVER_EMAIL,         // Địa chỉ đã xác minh ở bước Single Sender
          subject: subject,
          text: text,
          html: `<h3>Mã OTP của bạn là: ${otp}</h3>`, // Nội dung email dạng HTML
        };

        sgMail
          .send(msg)
          .then(() => {
            console.log('Email đã được gửi!');
            console.log(msg)
          })
          .catch((error) => {
            console.error('Lỗi khi gửi email:', error);
          });

        // Mã hóa OTP
        return bcrypt.hash(otp, salt);
    } catch (error) {
        console.error('Error sending email: ', error);
    }
}

module.exports = { checkEmailExists, sendOTP };