const auth = require("../config/firebaseConfig");

// 📌 Đăng ký tài khoản & gửi email xác nhận
exports.signUp = async (req, res) => {
    const { email, password } = req.body;

    try {
        const userRecord = await auth.createUser({
            email,
            password,
            emailVerified: false,
        });

        const link = await auth.generateEmailVerificationLink(email);
        console.log("Link xác nhận:", link);

        res.status(200).json({ message: "Mã xác nhận đã gửi!", link });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 📌 Xác nhận Email
exports.verifyEmail = async (req, res) => {
    const { email } = req.body;

    try {
        const userRecord = await auth.getUserByEmail(email);
        if (userRecord.emailVerified) {
            res.status(200).json({ message: "Email đã được xác nhận!" });
        } else {
            res.status(400).json({ message: "Email chưa được xác nhận!" });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
