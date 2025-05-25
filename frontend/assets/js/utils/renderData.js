import { isRichText } from "./renderMessage.js";

async function getDataFromDocument(typeData) {
    if (typeData === "text") {
        const content = document.getElementById("message-input").value.trim();
        const type = isRichText(content) ? "rich-text" : "text";  // Kiểm tra xem có phải rich text hay không
        const replyTo = "";

        return { type, content, replyTo };
    } else if (typeData === "file") {
        const files = document.getElementById('attachment').files;
        if (files.length === 0) return;  // Kiểm tra nếu không có tệp nào được chọn

        const type = files[0].type.replace(/\\$/, '');  // Loại bỏ dấu \ nếu có ở cuối chuỗi
        const replyTo = "";

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
        return `${Math.floor(diffDays)} ngày trước`;
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

    // Currently active (within last 5 minutes)
    if (diffMs < 5 * 60 * 1000) {
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

export {
    getDataFromDocument,
    convertFileToBinary,
    convertToDate,
    formatRelativeTimeRead,
    formatRelativeTimeOnline
};