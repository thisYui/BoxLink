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

// Ví dụ sử dụng:


export {
    getDataFromDocument,
    convertFileToBinary,
    convertToDate
};