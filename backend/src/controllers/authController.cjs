const { admin, db } = require("../config/firebaseConfig.cjs");
const bcrypt = require("bcrypt");
const { checkEmailExists, sendOTP } = require("../services/emailServices.cjs");

let users = []; // (email, displayName, hashOTP)
let otps = [];  // (email, hashOTP)

// Tạo người dùng mới
async function createAuth(email, password, displayName) {
    try {
        // Tạo người dùng mới qua Firebase Admin SDK
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password
        });

        // Ghi dữ liệu vào Firestore
        await db.collection("users").doc(userRecord.uid).set({
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: displayName,
            status: "online",
            createdAt: new Date().toISOString(),
            chatList: [],
            auth: `users/${userRecord.uid}`,
            avatar: "default.png",
            friendList: [],
        });

        console.log("Tạo tài khoản thành công và đã lưu Firestore.");
    } catch (error) {
        console.error("Lỗi khi tạo tài khoản:", error);
        throw error;
    }
}

// Xác thực OTP
async function verifyOTP(hashOTP, otp) {
    try {
        const match = await bcrypt.compare(otp.toString(), await hashOTP);

        if (match) {
            console.log('OTP xác thực thành công!');
            return true;
        } else {
            console.log('OTP không hợp lệ!');
            return false;
        }
    } catch (error) {
        console.error('Error verifying OTP: ', error);
    }
}

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
    const { email, newPassword } = req.body;

    try {
        // Tìm user từ email
        const userRecord = await admin.auth().getUserByEmail(email);

        // Cập nhật mật khẩu mới
        await admin.auth().updateUser(userRecord.uid, {
            password: newPassword,
        });

        otps = otps.filter(u => u.email !== email);
        res.status(200).json({ message: 'Mật khẩu đã được cập nhật thành công!' });
    } catch {
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

module.exports = { signUp,
    confirmOTP,
    requestOTP,
    resetPassword
};
