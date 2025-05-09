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
        const data = await new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onloadend = function() {
                resolve(reader.result);  // Trả về dữ liệu nhị phân (ArrayBuffer)
            };

            reader.onerror = function(error) {
                reject('Lỗi khi đọc tệp: ' + error);  // Trả về lỗi nếu có vấn đề khi đọc tệp
            };

            reader.readAsArrayBuffer(file);  // Đọc tệp dưới dạng ArrayBuffer (dữ liệu nhị phân)
        });

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

export { getDataFromDocument };