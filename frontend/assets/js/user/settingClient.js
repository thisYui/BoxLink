import { loadLanguage } from "../config/i18n.js"

// Đăng xuất
function logout() {
    // Xóa thông tin đăng nhập
    localStorage.removeItem("uid");
    sessionStorage.removeItem("userData");
    sessionStorage.removeItem("lastClickedUser");

    // Chuyển hướng về trang đăng nhập
    window.location.href = "auth.html";
}

// Thay đổi ngôn ngữ
async function changeLanguage() {
    const language = document.getElementById("language-select").value;

    if (language !== sessionStorage.getItem("lang")) {
        await loadLanguage(language);
    }
}

function applyTheme(theme) {
    // Áp dụng theme mới
    const themeStyleSheet = document.getElementById('theme-style');
    themeStyleSheet.href = `css/${theme}-theme.css`;
}

export {
    logout,
    changeLanguage,
    applyTheme
}

