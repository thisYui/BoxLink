const { admin, db } = require("../config/firebaseConfig.cjs");
const bcrypt = require("bcrypt");
const sgMail = require('@sendgrid/mail');
const { app } = require("../config/appConfig.cjs");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const saltRounds = 10;
let users = []; // (email, displayName, hashOTP)
let otps = [];  // (email, hashOTP)

async function checkEmailExists(email, displayName) {
    try {
        const snapshot = await db.collection("users")
            .where("email", "==", email)
            .where("displayName", "==", displayName)
            .get();

        return !snapshot.empty; // Trả về true nếu có ít nhất 1 user khớp
    } catch (error) {
        console.error("Lỗi khi kiểm tra email:", error);
        return false;
    }
}

// Hàm gửi email
function sendEmail(to, subject, text, salt) {
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

async function codeAuthenticate(email, code, objects, res) {
    const object = objects.find(user => user.email === email);

    if (!object) {
        return res.status(404).json({ message: 'Người dùng không tồn tại!' });
    }

    // Xác thực mã OTP
    verifyOTP(object.hashOTP, code).then(result => {
        if (result) {
            res.status(200).json({ message: 'Xác thực thành công!' });
        } else {
            res.status(400).json({ message: 'Mã xác thực không hợp lệ!' });
        }
    })
}

app.post('/api/signup', (req, res) => {
    const {email, password, displayName} = req.body;

    // Kiểm tra nếu email đã tồn tại
    checkEmailExists(email, displayName)
        .then(exists => {
            if (exists) {
                return res.status(400).json({message: 'Email đã tồn tại!'});
            }
        })
        .catch(error => {
            console.error("Lỗi khi kiểm tra email:", error);
            return res.status(500).json({message: 'Lỗi hệ thống!'});
        });

    // Mã hóa mật khẩu
    const hashOTP = sendEmail(email, 'Xác thực tài khoản', 'Đây là mã xác thực của bạn', saltRounds);

    // Lưu thông tin người dùng vào User
    const user = {
        email,
        displayName,
        hashOTP // OTP
    };

    users.push(user); // Thêm người dùng vào danh sách

    createAuth(email, password, displayName)
        .then(() => {
            res.status(200).json({message: 'Chờ mã xác nhận!'});
        })
        .catch(error => {
            console.error("Lỗi khi tạo tài khoản:", error);
            res.status(500).json({message: 'Lỗi hệ thống!'});
        });
});

app.post('/api/confirm', (req, res) => {
    const { email, code , type } = req.body;

    if (type === "signUp") {
        codeAuthenticate(email, code, users, res).then(r => {
            if (r) {
                // Xóa nội dung người dùng khỏi danh sách sau khi xác thực
                users = users.filter(u => u.email !== email);
            }
        });
    } else if (type === "resetPassword") {
        codeAuthenticate(email, code, otps, res).then(r => {});
    }
});

app.post('/api/request', (req, res) => {
    const { email } = req.body;
    const hashOTP = sendEmail(email, 'Xác thực tài khoản', 'Đây là mã xác thực của bạn', saltRounds);

    otps.push({ email, hashOTP }); // Thêm mã OTP vào danh sách

    res.status(200).json({ message: 'Mã xác thực đã được gửi!' });
});

app.post('/api/resetPassword', async (req, res) => {
    const { email, newPassword } = req.body;

    try {
        // Tìm user từ email
        const userRecord = await admin.auth().getUserByEmail(email);

        // Cập nhật mật khẩu mới
        await admin.auth().updateUser(userRecord.uid, {
            password: newPassword,
        });

        otps = otps.filter(u => u.email !== email); // Xóa mã OTP đã sử dụng

        console.log("Mật khẩu đã được cập nhật thành công.");
        res.status(200).json({ message: 'Mật khẩu đã được cập nhật thành công!' });
    } catch (error) {
        console.error("Lỗi khi cập nhật mật khẩu:", error);
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
});
