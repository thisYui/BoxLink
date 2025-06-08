const socialIconMap = {
    "facebook.com": "fab fa-facebook",
    "twitter.com": "fab fa-twitter",
    "linkedin.com": "fab fa-linkedin",
    "github.com": "fab fa-github",
    "youtube.com": "fab fa-youtube",
    "instagram.com": "fab fa-instagram",
    "tiktok.com": "fab fa-tiktok",
    "medium.com": "fab fa-medium",
    "default": "fas fa-link"
};

function getIconClassForUrl(url) {
    const hostname = new URL(url).hostname;
    const domain = Object.keys(socialIconMap).find(key => hostname.includes(key));
    return socialIconMap[domain] || socialIconMap["default"];
}

function isRichText(inputText) {
    // Regex kiểm tra URL
    const urlRegex = /https?:\/\/[^\s]+/g;
    // Regex kiểm tra emoji (Unicode)
    const emojiRegex = /[\u{1F600}-\u{1F64F}|\u{1F300}-\u{1F5FF}|\u{1F680}-\u{1F6FF}|\u{1F700}-\u{1F77F}|\u{1F780}-\u{1F7FF}|\u{1F800}-\u{1F8FF}|\u{1F900}-\u{1F9FF}|\u{1FA00}-\u{1FA6F}|\u{1FA70}-\u{1FAFF}|\u{2600}-\u{26FF}|\u{2700}-\u{27BF}]/gu;

    // Kiểm tra sự tồn tại của URL hoặc emoji
    const hasUrl = urlRegex.test(inputText);
    const hasEmoji = emojiRegex.test(inputText);

    // Nếu có URL hoặc emoji, trả về true (rich text)
    return hasUrl || hasEmoji;
}

function isValidMessage(content) {
    // Trường hợp content là chuỗi (text, rich-text)
    if (typeof content === 'string') {
        if (content.trim() === '') return false;                // Rỗng
        if (content.length > 1000) return false;                // Quá dài
        return true;
    }

    // Trường hợp content là object (file)
    if (typeof content === 'object' && content !== null) {
        const { fileName, size, data } = content;
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (fileName && size && data) {
            if (size > maxSize) {
                alert("Kích thước tệp vượt quá giới hạn 5MB. Vui lòng chọn tệp khác.");
                return false;
            }
            return true;
        }
    }

    // Các trường hợp không hợp lệ
    return false;
}

async function getDataFromDocument(typeData) {
    if (typeData === "text") {
        const content = document.getElementById("message-input").value.trim();
        const type = isRichText(content) ? "rich-text" : "text";  // Kiểm tra xem có phải rich text hay không
        const replyTo = sessionStorage.getItem("replyMessageID");

        return { type, content, replyTo };

    } else if (typeData === "file") {
        const files = document.getElementById('attachment').files;
        if (files.length === 0) return;  // Kiểm tra nếu không có tệp nào được chọn

        const type = files[0].type.split('/')[0];
        const replyTo = sessionStorage.getItem("replyMessageID");

        const file = files[0];  // Giả sử bạn muốn lấy tệp đầu tiên

        // Chờ để đọc tệp
        const data = await convertFileToBinary(file);

        return {
            type,
            content: {
                fileName: file.name,  // Tên tệp
                size: file.size,  // Kích thước tệp
                data: data  // Dữ liệu nhị phân của tệp
            },
            replyTo
        };
    }
}

// Chuyển từ file thành binary data
async function convertFileToBinary(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(event) {
            resolve(event.target.result);
        };
        reader.onerror = function(error) {
            reject(error);
        };
        reader.readAsArrayBuffer(file);
    });
}

// Chuyển đổi thời gian từ Firestore thành đối tượng Date
function convertToDate(timeSend) {
    // Lấy số giây từ _seconds và chuyển đổi sang mili giây
    const date = new Date(timeSend._seconds * 1000);

    // Lấy phần nanoseconds và chuyển đổi sang mili giây
    const nanoSeconds = timeSend._nanoseconds / 1000000;

    // Thêm phần nanoseconds vào đối tượng Date (nếu cần độ chính xác cao hơn)
    const timeWithNano = date.getTime() + nanoSeconds;

    // Trả về thời gian chính xác cao hơn nếu cần thiết, hoặc chỉ trả về date
    return new Date(timeWithNano);
}

function dateToDMY(date) {
    const d = new Date(date);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

function dateToYMD(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function isOnline(inputDate) {
    const now = new Date();
    const date = new Date(inputDate);
    const diffMs = now - date;

    // Kiểm tra xem thời gian khác nhau có nhỏ hơn 2 phút không
    return diffMs < 2 * 60 * 1000; // 2 phút
}

function formatRelativeTimeRead(inputDate) {
    const now = new Date();
    const date = new Date(inputDate);
    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffHours / 24;
    const diffYears = now.getFullYear() - date.getFullYear();

    if (diffHours < 24) {
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;

    } else if (diffDays < 10) {
        return `${Math.floor(diffDays)} ngày`;

    } else if (diffYears < 1) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `${day}/${month}`;

    } else {
        return `${date.getFullYear()}`;
    }
}

function formatRelativeTimeOnline(inputDate) {
    const now = new Date();
    const date = new Date(inputDate);
    const diffMs = now - date;

    // Calculate time differences
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffYears = now.getFullYear() - date.getFullYear();

    // Currently active (within the last 2 minutes)
    if (diffMs < 2 * 60 * 1000) {
        return "Đang hoạt động";

    }  else if (diffHours < 1) {
        return `Hoạt động ${diffMinutes} phút trước`;

    } else if (diffHours < 24) {
        const remainingMinutes = diffMinutes % 60;
        if (remainingMinutes > 0) {
            return `Hoạt động ${diffHours} giờ ${remainingMinutes} phút trước`;
        } else {
            return `Hoạt động ${diffHours} giờ trước`;
        }

    } else if (diffDays < 10) {
        return `Hoạt động ${diffDays} ngày trước`;

    } else if (diffYears < 1) {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `Hoạt động ngày ${day}/${month}`;

    } else {
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        return `Hoạt động ngày ${day}/${month}/${date.getFullYear()}`;
    }
}

function formatRelativeTimeSend(inputDate) {
    const now = new Date();
    const date = new Date(inputDate);
    const diffMs = now - date;

    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffYears = now.getFullYear() - date.getFullYear();

    if (diffDays < 1) {
        return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

    } else if (diffYears < 1) {
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;

    } else {
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
    }
}

export {
    getIconClassForUrl,
    isValidMessage,
    getDataFromDocument,
    convertFileToBinary,
    convertToDate,
    dateToDMY,
    dateToYMD,
    isOnline,
    formatRelativeTimeRead,
    formatRelativeTimeOnline,
    formatRelativeTimeSend
};