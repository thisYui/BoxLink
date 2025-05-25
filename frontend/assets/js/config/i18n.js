function getUserLanguage() {
  // Lấy ngôn ngữ của trình duyệt (ví dụ: 'en', 'vi', 'fr', ...)
  const userLanguage = navigator.language || navigator.userLanguage;

  // Trả về ngôn ngữ mặc định (chuỗi ngắn, ví dụ: 'en', 'vi', ...)
  return userLanguage.split('-')[0]; // Tách ra phần ngôn ngữ trước dấu '-'
}

// Hàm tải ngôn ngữ và áp dụng bản dịch vào trang
async function loadLanguage(lang = 'en') {
    let response;

    try {
        // Tải file ngôn ngữ từ thư mục assets/i18n/
        response = await fetch(`assets/i18n/${lang}.json`);
        sessionStorage.setItem("lang", lang); // Lưu ngôn ngữ vào sessionStorage
    } catch (error) {
        // Nếu gặp lỗi, tải file ngôn ngữ mặc định (en)
        response = await fetch(`assets/i18n/en.json`);
        sessionStorage.setItem("lang", "en"); // Lưu ngôn ngữ mặc định vào sessionStorage
    }

    // Chuyển đổi dữ liệu JSON thành đối tượng
    window.translations = await response.json();

    // Hàm dịch đơn giản
    window.t = function(key) {
        return key.split('.').reduce((obj, k) => (obj && obj[k] !== undefined) ? obj[k] : key, translations);
    };

    // Áp dụng bản dịch lên HTML
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            el.placeholder = t(key); // Dịch placeholder
        } else {
            el.innerText = t(key); // Dịch nội dung văn bản
        }
    });

    // Cập nhật các placeholder có data-i18n-placeholder
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key); // Dịch placeholder
    });
}

export {
    loadLanguage,
    getUserLanguage
}