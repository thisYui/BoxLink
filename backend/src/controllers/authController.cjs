const {admin} = require("../config/firebaseConfig.cjs");
const { checkEmailExists, sendOTP , verifyOTP} = require("../services/emailServices.cjs");
const { setPassword } = require("../services/userServices.cjs");
const { createAuth } = require("../services/firebaseServices.cjs");
const logger = require('../config/logger.cjs');

let users = []; // (email, displayName, hashOTP)
let otps = [];  // (email, hashOTP)

// Xử lý đăng ký tài khoản
async function signUp(req, res) {
    const { email, password, displayName } = req.body;

    if (await checkEmailExists(email)) {
        return res.status(400).json({ message: 'Email đã tồn tại!' });
    }

    const hashOTP = await sendOTP(email, 'Xác thực tài khoản', 'Đây là mã xác thực tài khoản của bạn', 10);
    users.push({ email, displayName, hashOTP });

    try {
        await createAuth(email, password, displayName);
        res.status(200).json({ message: 'Chờ mã xác nhận!' });
    } catch {
        logger.error('Lỗi khi tạo tài khoản:', error);
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

// Xử lý xác thực mã OTP
async function confirmOTP(req, res) {
    const { email, code, type } = req.body;
    const list = type === "signUp" ? users : otps;

    const user = list.find(u => u.email === email);
    if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại!' });

    const valid = await verifyOTP(user.hashOTP, code);
    if (!valid) return res.status(400).json({ message: 'Mã xác thực không hợp lệ!' });

    // Xóa OTP đã dùng
    if (type === "signUp") users.splice(users.indexOf(user), 1);

    res.status(200).json({ message: 'Xác thực thành công!' });
}

// Xử lý gửi mã OTP cho người dùng
async function requestOTP(req, res) {
    const { email } = req.body;
    const hashOTP = await sendOTP(email, 'Xác thực tài khoản', 'Đây là mã xác thực tài khoản của bạn', 10);
    otps.push({ email, hashOTP });

    res.status(200).json({ message: 'Mã xác thực đã được gửi!' });
}

// Xử lý đặt lại mật khẩu
async function resetPassword(req, res) {
    const { email, password } = req.body;
    const user = await admin.auth().getUserByEmail(email);
    setPassword(user.uid, password).then( result => {
        if (result) {
            otps = otps.filter(u => u.email !== email);
            res.status(200).json({message: 'Đặt lại mật khẩu thành công!'});

        } else {
            logger.error('Lỗi khi đặt lại mật khẩu:');
            res.status(500).json({message: 'Lỗi hệ thống!'});
        }
    });
}

module.exports = {
    signUp,
    confirmOTP,
    requestOTP,
    resetPassword
};
