// import { auth,
//     createUserWithEmailAndPassword,
//     applyActionCode,
//     signInWithEmailAndPassword,
//     sendPasswordResetEmail
// } from "../../config/firebaseConfig.js";
//
// window.showOnly = function (id) {
//     const listForm = ['logInForm', 'signUpForm', 'resetPasswordForm'];
//     listForm.forEach((form) => {
//         if (form === id) {
//             document.getElementById(form).style.display = 'block';
//         } else {
//             document.getElementById(form).style.display = 'none';
//         }
//     });
// }
//
// document.addEventListener("DOMContentLoaded", function () {
//     document.addEventListener("submit", async function (event) { // 🛠️ Thêm async vào đây
//         event.preventDefault(); // Ngăn chặn reload trang
//
//         let form = event.target; // Xác định form nào được submit
//         let formData = new FormData(form);
//
//         switch (form.id) {
//             case "logInForm":
//                 await logIn(formData);
//                 break;
//             case "inputSignUpForm":
//                 confirmSignUp();  // Chuyển sang màng hình xác nhận
//                 await requestSignUp(formData); // 🛠️ Gọi hàm async với await
//                 break;
//             case "confirmSignUpForm":
//                 await confirmCodeSignUp(formData);
//                 break;
//             case "inputEmailForm":
//                 switchForm();  // Chuyển sang màng hình nhập mã xác nhận
//                 await sendCode(formData);
//                 break;
//             case "confirmCodeForm":
//                 switchForm();  // Chuyern sang màng hình cài đặt lại mật khẩu
//                 await confirmCode(formData);
//                 break;
//             case "newPasswordForm":
//                 await confirmResetPassword(formData);
//                 break;
//             default:
//                 console.warn("Form không xác định:", form.id);
//         }
//     });
// });
//
// window.confirmSignUp = function () {
//     const signUpForm = document.getElementById('inputSignUpForm');
//     const confirmSignUpForm = document.getElementById('confirmSignUpForm');
//
//     confirmSignUpForm.style.display = 'block';
//     signUpForm.style.display = 'none';
// }
//
// window.switchForm = function () {
//     const listFormResetPassword = ['inputEmailForm', 'confirmCodeForm', 'newPasswordForm'];
//
//     for (let i = 0; i < listFormResetPassword.length; i++) {
//         const curForm = document.getElementById(listFormResetPassword[i]);
//          if (curForm && window.getComputedStyle(curForm).display !== 'none') {
//             if (i !== listFormResetPassword.length - 1) {
//                 curForm.style.display = 'none';
//                 let nextForm = document.getElementById(listFormResetPassword[(i + 1) % listFormResetPassword.length]);
//                 if (nextForm) nextForm.style.display = 'block';
//                 break;
//             }
//         }
//     }
// }
//
// window.resendCode = function () {
//     sendCode(".");
// }
//
// // Các hàm xử lý form
// window.logIn = async function (formData) {
//     const email = formData.get("email");
//     const password = formData.get("password");
//     // Thêm logic xử lý đăng nhập
//
//     try {
//         // Gửi request đăng nhập lên Firebase
//         const userCredential = await signInWithEmailAndPassword(auth, email, password);
//         const user = userCredential.user;
//
//         console.log("Đăng nhập thành công:", user);
//         alert(`Chào mừng, ${user.email}!`);
//
//         // Chuyển hướng đến trang chính sau khi đăng nhập
//         window.location.href = "index.html";
//     } catch (error) {
//         console.error("Lỗi đăng nhập:", error.message);
//         alert("Sai email hoặc mật khẩu. Vui lòng thử lại.");
//     }
// }
//
// window.requestSignUp = async function (formData) {
//     const email =  formData.get("email");
//     const password = formData.get("password");
//     const confirmPassword = formData.get("confirm password");
//
//     if (password !== confirmPassword) {
//         alert("Mật khẩu không khớp. Vui lòng nhập lại.");
//         return;
//     }
//
//     try {
//         const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//         const user = userCredential.user;
//
//         console.log("User registered successfully:", user);
//         sendCode(email).then(() => console.log("Mã xác nhận đã được gửi!"));
//     } catch (error) {
//         console.error("Error during sign-up:", error.message);
//         alert("Đăng ký thất bại: " + error.message);
//     }
// }
//
// window.confirmCodeSignUp = async function (formData) {
//     const code =  formData.get("confirmation code");
//     // Thêm logic xác nhận mã đăng ký
//
//     try {
//         // Gửi mã xác nhận lên Firebase
//         await applyActionCode(auth, code);
//         alert("Xác nhận thành công! Tài khoản đã được kích hoạt.");
//
//         // Chuyển hướng về lại trang đăng nhập
//         window.location.href = "auth.html";
//     } catch (error) {
//         console.error("Lỗi xác nhận mã:", error.message);
//         alert("Mã xác nhận không hợp lệ hoặc đã hết hạn.");
//     }
// }
//
// window.sendCode = async function (formData) {
//     const email = formData.get("email");
//     // Thêm logic gửi mã reset mật khẩu
//
//     try {
//         // Gửi yêu cầu đặt lại mật khẩu
//         await sendPasswordResetEmail(auth, email);
//         alert("Mã đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư!");
//     } catch (error) {
//         console.error("Lỗi gửi mã đặt lại mật khẩu:", error.message);
//         alert("Không thể gửi mã. Vui lòng kiểm tra lại email.");
//     }
// }
//
// window.confirmCode = async function (formData) {
//     const code = formData.get("confirmation code");
//
//     try {
//         // Gửi mã xác nhận lên Firebase
//         await applyActionCode(auth, code);
//         alert("Xác nhận thành công! ");
//
//     } catch (error) {
//         console.error("Lỗi xác nhận mã:", error.message);
//         alert("Mã xác nhận không hợp lệ hoặc đã hết hạn.");
//     }
// }
//
// window.confirmResetPassword = async function (formData) {
//     const newPassword = formData.get("new password");
//     const confirmPassword = formData.get("confirm new password");
//
//     if (newPassword !== confirmPassword) {
//         alert("Mật khẩu không khớp. Vui lòng nhập lại.");
//         return;
//     }
//
//     try {
//         // Gửi yêu cầu đặt lại mật khẩu
//         await applyActionCode(auth, newPassword);
//         alert("Đặt lại mật khẩu thành công! ");
//         window.location.href = "auth.html";
//     } catch (error) {
//         console.error("Lỗi đặt lại mật khẩu:", error.message);
//         alert("Không thể đặt lại mật khẩu. Vui lòng thử lại.");
//     }
// }
import { auth,
    createUserWithEmailAndPassword,
    applyActionCode,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    verifyPasswordResetCode,
    confirmPasswordReset
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
                confirmSignUp(); // Chuyển form trước
                requestSignUp(formData).then(); // Không chờ đợi
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

// 🛠️ Đăng nhập
window.logIn = async function (formData) {
    const email = formData.get("email");
    const password = formData.get("password");
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Đăng nhập thành công:", userCredential.user);
        alert(`Chào mừng, ${userCredential.user.email}!`);
        window.location.href = "index.html";
    } catch (error) {
        console.error("Lỗi đăng nhập:", error.message);
        alert("Sai email hoặc mật khẩu. Vui lòng thử lại.");
    }
};

// 🛠️ Đăng ký tài khoản
window.requestSignUp = async function (formData) {
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirm password");

    if (password !== confirmPassword) {
        alert("Mật khẩu không khớp. Vui lòng nhập lại.");
        return;
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("User registered successfully:", userCredential.user);
        sendCode(email).then(); // Không chặn UI
    } catch (error) {
        console.error("Lỗi đăng ký:", error.message);
        alert("Đăng ký thất bại: " + error.message);
    }
};

// 🛠️ Xác nhận mã email đăng ký
window.confirmCodeSignUp = async function (formData) {
    const code = formData.get("confirmation code");
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
    const code = formData.get("confirmation code");
    try {
        await verifyPasswordResetCode(auth, code);
        alert("Mã hợp lệ! Vui lòng đặt lại mật khẩu mới.");
        switchForm(); // Chuyển sang form đặt mật khẩu
    } catch (error) {
        console.error("Lỗi xác nhận mã:", error.message);
        alert("Mã xác nhận không hợp lệ hoặc đã hết hạn.");
    }
};

// 🛠️ Đặt lại mật khẩu
window.confirmResetPassword = async function (formData) {
    const code = formData.get("confirmation code"); // 🔥 Cần lưu mã trước đó khi nhập
    const newPassword = formData.get("new password");
    const confirmPassword = formData.get("confirm new password");

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
