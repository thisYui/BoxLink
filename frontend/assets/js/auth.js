import {
    auth,
    createUserWithEmailAndPassword,
    applyActionCode,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    verifyPasswordResetCode,
    confirmPasswordReset,
    collection,
    query,
    where,
    db,
    doc,
    getDocs,
    setDoc
} from "../../config/firebaseConfig.js";

// 🛠️ Hiển thị form tương ứng
window.showOnly = function (id) {
    const listForm = ['logInForm', 'signUpForm', 'resetPasswordForm'];
    listForm.forEach((form) => {
        document.getElementById(form).style.display = (form === id) ? 'block' : 'none';
    });
};

// 🛠️ Xử lý submit form
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
                switchForm(); // Chuyển form trước
                sendCode(formData).then(); // Không chờ đợi
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

// 🛠️ Chuyển form đăng ký -> nhập mã xác nhận
window.confirmSignUp = function () {
    document.getElementById('inputSignUpForm').style.display = 'none';
    document.getElementById('confirmSignUpForm').style.display = 'block';
};

// 🛠️ Chuyển form đặt lại mật khẩu
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

window.checkEmailExists = async function (email) {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // Trả về true nếu email đã tồn tại
}

// 🛠️ Đăng nhập
window.logIn = async function (formData) {
    const email = formData.get("email");
    const password = formData.get("password");

    console.log(email, password);

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        alert(`Đăng nhập thành công! Chào mừng ${userCredential.user.email}`);
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

    if (await checkEmailExists(email)) {
        alert("Email đã được sử dụng!");
        return false;
    }

    try {
        const user = await createUserWithEmailAndPassword(auth, email, password);
        console.log("User registered successfully:", user.user);

        await setDoc(doc(db, "users", user.uid), {
            uid: user.uid,  // Giữ UID ngay trong document
            email: user.email,
            displayName: displayName,
            status: "online",
            createdAt: new Date().toISOString()
        });

        sendCode(formData).then(); // Không chặn UI
    } catch (error) {
        console.error("Lỗi đăng ký:", error.message);
        alert("Đăng ký thất bại: " + error.message);
    }
};

// 🛠️ Xác nhận mã email đăng ký
window.confirmCodeSignUp = async function (formData) {
    const code = formData.get("confirmationCode");
    try {
        await applyActionCode(auth, code);
        alert("Xác nhận thành công! Tài khoản đã được kích hoạt.");
        window.location.href = "auth.html";
    } catch (error) {
        console.error("Lỗi xác nhận mã:", error.message);
        alert("Mã xác nhận không hợp lệ hoặc đã hết hạn.");
    }
};

// 🛠️ Gửi mã đặt lại mật khẩu
window.sendCode = async function (formData) {
    const email = formData.get("email");
    try {
        await sendPasswordResetEmail(auth, email);
        alert("Mã đặt lại mật khẩu đã được gửi đến email của bạn.");
    } catch (error) {
        console.error("Lỗi gửi mã:", error.message);
        alert("Không thể gửi mã. Vui lòng kiểm tra lại email.");
    }
};

// 🛠️ Xác nhận mã reset mật khẩu
window.confirmCode = async function (formData) {
    const code = formData.get("confirmationCode");
    try {
        await verifyPasswordResetCode(auth, code);
        alert("Mã hợp lệ! Vui lòng đặt lại mật khẩu mới.");
        localStorage.setItem("resetCode", code); // 🔥 Lưu mã vào localStorage
        switchForm(); // Chuyển sang form đặt mật khẩu
    } catch (error) {
        console.error("Lỗi xác nhận mã:", error.message);
        alert("Mã xác nhận không hợp lệ hoặc đã hết hạn.");
    }
};


// 🛠️ Đặt lại mật khẩu
window.confirmResetPassword = async function (formData) {
    const code = formData.get("confirmationCode"); // 🔥 Cần lưu mã trước đó khi nhập
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmNewPassword");

    if (newPassword !== confirmPassword) {
        alert("Mật khẩu không khớp. Vui lòng nhập lại.");
        return;
    }

    try {
        await confirmPasswordReset(auth, code, newPassword);
        alert("Đặt lại mật khẩu thành công!");
        window.location.href = "auth.html";
    } catch (error) {
        console.error("Lỗi đặt lại mật khẩu:", error.message);
        alert("Không thể đặt lại mật khẩu. Vui lòng thử lại.");
    }
};
