import {
    auth,
    signInWithEmailAndPassword,
} from "./config/firebaseConfig.js";

// Hiển thị form tương ứng
window.showOnly = function (id) {
    const listForm = ['logInForm', 'signUpForm', 'resetPasswordForm'];
    listForm.forEach((form) => {
        document.getElementById(form).style.display = (form === id) ? 'block' : 'none';
    });
};

// Xử lý submit form
document.addEventListener("DOMContentLoaded", function () {
    document.addEventListener("submit", async function (event) {
        event.preventDefault();
        let form = event.target;
        let formData = new FormData(form);

        switch (form.id) {
            case "logInForm":
                await logIn(formData);
                break;
            case "inputSignUpForm":
                requestSignUp(formData).then(result => {
                    if (result) {
                        confirmSignUp(); // Chuyển form trước
                    }});
                break;
            case "confirmSignUpForm":
                await confirmCodeSignUp(formData);
                break;
            case "inputEmailForm":
                sendCode(formData).then(result => {
                    if (result) {
                        switchForm();
                    }});
                break;
            case "confirmCodeForm":
                await confirmCode(formData);
                break;
            case "newPasswordForm":
                await confirmResetPassword(formData);
                break;
            default:
                console.warn("Form không xác định:", form.id);
        }
    });
});

// Chuyển form đăng ký -> nhập mã xác nhận
window.confirmSignUp = function () {
    document.getElementById('inputSignUpForm').style.display = 'none';
    document.getElementById('confirmSignUpForm').style.display = 'block';
};

// Chuyển form đặt lại mật khẩu
window.switchForm = function () {
    const listFormResetPassword = ['inputEmailForm', 'confirmCodeForm', 'newPasswordForm'];
    for (let i = 0; i < listFormResetPassword.length; i++) {
        const curForm = document.getElementById(listFormResetPassword[i]);
        if (curForm && curForm.style.display !== 'none') {
            curForm.style.display = 'none';
            let nextForm = document.getElementById(listFormResetPassword[(i + 1) % listFormResetPassword.length]);
            if (nextForm) nextForm.style.display = 'block';
            break;
        }
    }
};

// Đăng nhập
window.logIn = async function (formData) {
    const email = formData.get("email");
    const password = formData.get("password");

    try {
        // Đăng nhập người dùng với email và password
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // Đăng nhập thành công, lấy user và UID
        const user = userCredential.user;
        const uid = user.uid;

        // Lưu UID vào localStorage
        localStorage.setItem("uid", uid);

        window.location.href = "index.html";
    } catch (error) {
        if (error.code === "auth/wrong-password") {
            alert("Mật khẩu không đúng!");
        } else if (error.code === "auth/user-not-found") {
            alert("Email chưa được đăng ký!");
        } else {
            alert("Lỗi đăng nhập: " + error.message);
        }
    }
};

// 🛠️ Đăng ký tài khoản
window.requestSignUp = async function (formData) {
    const displayName = formData.get("displayName");
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (password !== confirmPassword) {
        alert("Mật khẩu không khớp. Vui lòng nhập lại.");
        return false;
    }

    try {
        // Gửi thông tin đăng ký đến server
        const response = await fetch('http://localhost:3000/api/auth/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',  // Xác định kiểu dữ liệu là JSON
            },
            body: JSON.stringify({
                email,
                password,
                displayName
            }),
        });

        // Kiểm tra nếu phản hồi từ server thành công
        if (!response.ok) {
            const errorData = await response.json();
            alert("Lỗi: " + errorData.message);
            return false;
        }

        localStorage.setItem("email", email); // Lưu email vào localStorage

        return true;
    } catch (error) {
        console.error("Lỗi đăng ký:", error.message);
        alert("Đăng ký thất bại: " + error.message);
    }
};

// 🛠️ Xác nhận mã email đăng ký
window.confirmCodeSignUp = async function (formData) {
    const email = localStorage.getItem("email"); // Lấy email từ localStorage
    const code = formData.get("confirmationCode");

    try {
        // Gửi thông tin đăng ký đến server
        const response = await fetch('http://localhost:3000/api/auth/confirm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',  // Xác định kiểu dữ liệu là JSON
            },
            body: JSON.stringify({
                email,
                code,
                type: "signUp"
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert("Lỗi: " + errorData.message);
            return false;
        }

        window.location.href = "auth.html";
    } catch (error) {
        console.error("Lỗi xác nhận mã:", error.message);
        alert("Mã xác nhận không hợp lệ hoặc đã hết hạn.");
    }
};

// 🛠️ Gửi mã đặt lại mật khẩu
window.sendCode = async function (formData) {
    const email = formData.get("email");

    if (!email) {
        console.error("Email không được để trống!");
        return false;
    }

    try {
        // Gửi yêu cầu xác thực
        const response = await fetch('http://localhost:3000/api/auth/send-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',  // Xác định kiểu dữ liệu là JSON
            },
            body: JSON.stringify({
                email
            }),
        });

        // Kiểm tra nếu phản hồi từ server thành công
        if (!response.ok) {
            const errorData = await response.json();
            alert("Lỗi: " + errorData.message);
            return false;
        }

        localStorage.setItem("email", email); // Lưu email vào localStorage
        return true;
    } catch (error) {
        console.error("Lỗi khi gửi dữ liệu:", error);
        alert("Lỗi kết nối đến server!");
    }
};


// 🛠️ Xác nhận mã reset mật khẩu
window.confirmCode = async function (formData) {
    const email = localStorage.getItem("email"); // Lấy email từ localStorage
    const code = formData.get("confirmationCode");

    try {
        const response = await fetch('http://localhost:3000/api/auth/confirm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',  // Xác định kiểu dữ liệu là JSON
            },
            body: JSON.stringify({
                email,
                code,
                type: "resetPassword"
            }),
        });

        // Kiểm tra nếu phản hồi từ server thành công
        if (!response.ok) {
            const errorData = await response.json();
            alert("Lỗi: " + errorData.message);
            return false;
        }

        switchForm(); // Chuyển sang form đặt mật khẩu
    } catch (error) {
        console.error("Lỗi xác nhận mã:", error.message);
        alert("Mã xác nhận không hợp lệ hoặc đã hết hạn.");
    }
};

// 🛠️ Đặt lại mật khẩu
window.confirmResetPassword = async function (formData) {
    const email = localStorage.getItem("email"); // Lấy email từ localStorage
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmNewPassword");

    if (newPassword !== confirmPassword) {
        alert("Mật khẩu không khớp. Vui lòng nhập lại.");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/auth/reset-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',  // Xác định kiểu dữ liệu là JSON
            },
            body: JSON.stringify({
                email,
                newPassword,
            }),
        });

        // Kiểm tra nếu phản hồi từ server thành công
        if (!response.ok) {
            const errorData = await response.json();
            alert("Lỗi: " + errorData.message);
            return false;
        }

        alert("Đặt lại mật khẩu thành công!");
        window.location.href = "auth.html";
    } catch (error) {
        console.error("Lỗi đặt lại mật khẩu:", error.message);
        alert("Không thể đặt lại mật khẩu. Vui lòng thử lại.");
    }
};
