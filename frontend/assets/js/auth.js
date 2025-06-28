import { auth, signInWithEmailAndPassword } from "./config/firebaseConfig.js";
import { createSession, authenticateSession } from "./fetchers/session.js"
import { getUserLanguage, loadLanguage } from "./config/i18n.js";

// Create host URL from current location
const host = window.location.host;

// Redirect to index if user is already logged in
if (localStorage.getItem("uid") !== null) {
    authenticateSession().then( r => {
        if (r) {
            window.location.href = "/index.html";

        } else {
            localStorage.removeItem("uid");
            sessionStorage.removeItem("email");
        }
    })
}

// i18n
const lang = getUserLanguage();
loadLanguage(lang).then(() => {
    // Chỉnh sửa lại i18n
    document.querySelector(".privacy__confirmation").innerHTML = t("auth.privacy-policy");
});

/**
 * Display only the specified form and hide others
 * @param {string} id - ID of the form to display
 */
window.showOnly = function(id) {
    const listForm = ['logInForm', 'signUpForm', 'resetPasswordForm'];
    listForm.forEach((form) => {
        document.getElementById(form).style.display = (form === id) ? 'block' : 'none';
    });
};

/**
 * Handle form submissions
 */
document.addEventListener("DOMContentLoaded", function() {
    document.addEventListener("submit", async function(event) {
        event.preventDefault();
        const form = event.target;
        const formData = new FormData(form);

        switch (form.id) {
            case "logInForm":
                await logIn(formData);
                break;
            case "inputSignUpForm":
                requestSignUp(formData).then(result => {
                    if (result) {
                        confirmSignUp(); // Switch to confirmation form
                    }
                });
                break;
            case "confirmSignUpForm":
                await confirmCodeSignUp(formData);
                break;
            case "inputEmailForm":
                sendCode(formData).then(result => {
                    if (result) {
                        switchForm();
                    }
                });
                break;
            case "confirmCodeForm":
                await confirmCode(formData);
                break;
            case "newPasswordForm":
                await confirmResetPassword(formData);
                break;
            default:
                console.warn("Undefined form:", form.id);
        }
    });
});

/**
 * Switch from signup form to confirmation code form
 */
window.confirmSignUp = function() {
    document.getElementById('inputSignUpForm').style.display = 'none';
    document.getElementById('confirmSignUpForm').style.display = 'block';
};

/**
 * Cycle through password reset forms
 */
window.switchForm = function() {
    const resetPasswordForms = ['inputEmailForm', 'confirmCodeForm', 'newPasswordForm'];

    for (let i = 0; i < resetPasswordForms.length; i++) {
        const currentForm = document.getElementById(resetPasswordForms[i]);

        if (currentForm && currentForm.style.display !== 'none') {
            currentForm.style.display = 'none';

            // Get next form in the sequence
            const nextFormIndex = (i + 1) % resetPasswordForms.length;
            const nextForm = document.getElementById(resetPasswordForms[nextFormIndex]);

            if (nextForm) {
                nextForm.style.display = 'block';
            }
            break;
        }
    }
};

/**
 * Handle user login
 * @param {FormData} formData - Form data containing email and password
 */
window.logIn = async function(formData) {
    const email = formData.get("email");
    const password = formData.get("password");

    try {
        // Sign in user with email and password
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // Login successful, get user and UID
        const user = userCredential.user;
        const uid = user.uid;

        // Save UID to localStorage
        localStorage.setItem("uid", uid);

        await createSession(uid); // Create session token

        // Redirect to index page
        window.location.href = "/index.html";

    } catch (error) {
        // Handle specific error cases
        if (error.code === "auth/wrong-password") {
            alert("Incorrect password!");
        } else if (error.code === "auth/user-not-found") {
            alert("Email not registered!");
        } else {
            alert("Login error: " + error.message);
        }
    }
};

/**
 * Handle user signup request
 * @param {FormData} formData - Form data containing user details
 * @returns {Promise<boolean>} - Success status
 */
window.requestSignUp = async function(formData) {
    const displayName = formData.get("displayName");
    const email = formData.get("email");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");

    if (!email || !password || !displayName) {
        alert("Please fill in all fields.");
        return false;
    }

    // Validate password match
    if (password !== confirmPassword) {
        alert("Passwords don't match. Please try again.");
        return false;
    }

   if (password.length < 6) {
        alert("Password must be at least 6 characters long.");
        return false;
   }

    try {
        // Send registration information to server
        const response = await fetch(`http://${host}/api/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                password,
                displayName
            }),
        });

        // Check if server response is successful
        if (!response.ok) {
            const errorData = await response.json();
            alert("Error: " + errorData.message);
            return false;
        }

        // Save email to sessionStorage for confirmation step
        sessionStorage.setItem("email", email);
        return true;
    } catch (error) {
        console.error("Registration error:", error.message);
        alert("Registration failed: " + error.message);
        return false;
    }
};

/**
 * Confirm email verification code for signup
 * @param {FormData} formData - Form data containing confirmation code
 * @returns {Promise<boolean>} - Success status
 */
window.confirmCodeSignUp = async function(formData) {
    // Get email from sessionStorage
    const email = sessionStorage.getItem("email");
    const code = formData.get("confirmationCode");

    try {
        // Send confirmation data to server
        const response = await fetch(`http://${host}/api/auth/confirm`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                code,
                type: "signUp"
            }),
        });

        // Check if server response is successful
        if (!response.ok) {
            const errorData = await response.json();
            alert("Error: " + errorData.message);
            return false;
        }

        alert("Email verification successful! You can now log in.");

        // Redirect to auth page after successful confirmation
        window.location.href = "auth.html";
        return true;
    } catch (error) {
        console.error("Confirmation error:", error.message);
        alert("Invalid or expired confirmation code.");
        return false;
    }
};

/**
 * Send password reset code
 * @param {FormData} formData - Form data containing email
 * @returns {Promise<boolean>} - Success status
 */
window.sendCode = async function(formData) {
    const email = formData.get("email");

    // Validate email
    if (!email) {
        console.error("Email cannot be empty!");
        return false;
    }

    sessionStorage.setItem("email", email);
    await requestOTP(email);
};

async function requestOTP(email) {
    try {
        // Send verification request
        const response = await fetch(`http://${host}/api/auth/send-otp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email
            }),
        });

        // Check if server response is successful
        if (!response.ok) {
            const errorData = await response.json();
            alert("Error: " + errorData.message);
            return false;
        }
        return true;

    } catch (error) {
        console.error("Error sending data:", error);
        alert("Connection error to server!");
        return false;
    }
}

/**
 * Confirm password reset code
 * @param {FormData} formData - Form data containing confirmation code
 * @returns {Promise<boolean>} - Success status
 */
window.confirmCode = async function(formData) {
    // Get email from sessionStorage
    const email = sessionStorage.getItem("email");
    const code = formData.get("confirmationCode");

    try {
        // Send confirmation data to server
        const response = await fetch(`http://${host}/api/auth/confirm`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                code,
                type: "resetPassword"
            }),
        });

        // Check if server response is successful
        if (!response.ok) {
            const errorData = await response.json();
            alert("Error: " + errorData.message);
            return false;
        }

        // Switch to password reset form
        switchForm();
        return true;
    } catch (error) {
        console.error("Confirmation error:", error.message);
        alert("Invalid or expired confirmation code.");
        return false;
    }
};

/**
 * Reset password with new password
 * @param {FormData} formData - Form data containing new password
 * @returns {Promise<boolean>} - Success status
 */
window.confirmResetPassword = async function(formData) {
    // Get email from sessionStorage
    const email = sessionStorage.getItem("email");
    const newPassword = formData.get("newPassword");
    const confirmPassword = formData.get("confirmNewPassword");

    // Validate password match
    if (newPassword !== confirmPassword) {
        alert("Passwords don't match. Please try again.");
        return false;
    }

    try {
        // Send password reset request to server
        const response = await fetch(`http://${host}/api/auth/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email,
                newPassword,
            }),
        });

        // Check if server response is successful
        if (!response.ok) {
            const errorData = await response.json();
            alert("Error: " + errorData.message);
            return false;
        }

        // Show success message and redirect
        alert("Password reset successful!");
        window.location.href = "/auth.html";
        return true;
    } catch (error) {
        console.error("Password reset error:", error.message);
        alert("Unable to reset password. Please try again.");
        return false;
    }
};

/**
 * Resend confirmation code for email verification
 * @returns {Promise<void>}
 */
window.resendCode = async function() {
    const email = sessionStorage.getItem("email");
    await requestOTP(email);
}