import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

/**
 * Háy đổi các giá trị trong firebaseConfig này bằng thông tin từ Firebase Console của bạn.
 * Đổi tên file này thành firebaseConfig.js. (xóa dấu _ trước tên file này)
 * @type {{apiKey: string, authDomain: string, projectId: string, storageBucket: string, messagingsenderID: string, appId: string, measurementId: string}}
 */

const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingsenderID: "",
    appId: "",
    measurementId: ""
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export { signInWithEmailAndPassword };