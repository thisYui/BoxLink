const sgMail = require('@sendgrid/mail');
const { db, auth } = require("../config/firebaseConfig.cjs");
const bcrypt = require('bcrypt');
const logger = require('../config/logger.cjs');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Middleware để kiểm tra xem người dùng tồn tại
async function checkEmailExists(email) {
    try {
        const snapshot = await db.collection("users")
            .where("email", "==", email)
            .get();

        return !snapshot.empty; // Trả về true nếu có ít nhất 1 user khớp
    } catch (error) {
        logger.error("Lỗi khi kiểm tra email:", error);
        return false;
    }
}

// Thay đổi email
async function changeEmail(uid, newEmail) {
    try {
        const user = await auth.getUser(uid);

        if (user.email === newEmail) {
            return;
        }

        // Kiểm tra xem email mới đã tồn tại chưa
        const emailExists = await checkEmailExists(newEmail);
        if (emailExists) {
            throw new Error('Email đã tồn tại');
        }

        // Cập nhật email trong Firebase Authentication
        await auth.updateUser(uid, { email: newEmail });

        return true;

    } catch (error) {
        logger.error('Error changing email:', error);
        return false;
    }
}

// Hàm gửi email
function sendOTP(to, subject, text, salt) {
    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 số
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
                logger.info(msg)
            })
            .catch((error) => {
                logger.error('Lỗi khi gửi email:', error);
            });

        // Mã hóa OTP
        return bcrypt.hash(otp, salt);

    } catch (error) {
        logger.error('Error sending email: ', error);
    }
}

// Xác thực OTP
async function verifyOTP(hashOTP, otp) {
    try {
        const match = await bcrypt.compare(otp.toString(), await hashOTP);
        return !!match;

    } catch (error) {
        logger.error('Error verifying OTP: ', error);
    }
}

module.exports = { checkEmailExists, changeEmail, sendOTP, verifyOTP };