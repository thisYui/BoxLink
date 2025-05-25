import {getHyperlinkInfo} from '../fetchers/request.js';
import {fixMessageToChatBoxList, moveChatIDToFirstInListBox} from './chatProcessor.js';
import { formatRelativeTimeRead, formatRelativeTimeOnline } from "./renderData.js";

// Chỉ dùng cho server
function addMessageToChatBoxServer(message) {
    const senderID = message.senderId;  // ID người gửi
    const timeSend = message.timeSend;  // Thời gian gửi tin nhắn
    const type = message.type;  // Kiểu tin nhắn (text, image, video, file)
    const reply = message.replyTo;  // Tin nhắn trả lời (nếu có)
    const content = message.content;  // Nội dung tin nhắn

    if (type === "system" || type === "text") {
        const textMessage = content.text;  // Nội dung tin nhắn văn bản
        addTextMessageToChatBox(textMessage, senderID, type, timeSend, reply);  // Thêm tin nhắn vào chat box

    } else if (type === "image") {
        const urlImage = content.url;  // Đường dẫn đến ảnh
        addImageMessageToChatBox(urlImage, senderID, timeSend, reply);  // Thêm tin nhắn ảnh vào chat box

    } else if (type === "video") {
        const urlVideo = content.url;  // Đường dẫn đến video
        const duration = content.duration;  // Thời gian video
        addVideoMessageToChatBox(urlVideo, duration, senderID, timeSend, reply);  // Thêm tin nhắn video vào chat box

    } else if (type === "file") {
        const fileName = content.fileName;  // Tên tệp
        const size = content.size;  // Kích thước tệp
        const subtype = content.subtype;  // Loại tệp (file, audio)
        addFileMessageToChatBox(fileName, size, subtype, senderID, timeSend, reply);  // Thêm tin nhắn tệp vào chat box

    } else if (type === "link") {
        const title = content.title;  // Tiêu đề của trang web
        const description = content.description;  // Mô tả của trang web
        const thumbnail = content.thumbnail;  // Hình thu nhỏ của trang web
        const url = content.url;  // Đường dẫn đến trang web
        addLinkMessageToChatBox(title, description, thumbnail, url, senderID, timeSend, reply);  // Thêm tin nhắn link vào chat box

    } else if (type === "rich-text") {
        const richText = convertContentToString(content);  // Chuyển đổi nội dung rich text thành chuỗi
        addRichTextMessageToChatBox(richText, senderID, timeSend, reply);  // Thêm tin nhắn rich text vào chat box

    } else {
        console.warn("Loại tin nhắn không xác định:", type);
    }
}

// Chỉ dùng cho client
function addMessageToChatBoxClient(type, content, replyTo) {
    moveChatIDToFirstInListBox(sessionStorage.getItem("lastClickedUser"));  // Di chuyển đoạn chat của người gửi lên đầu danh sách

    const timeSend = new Date().toISOString();  // Thời gian gửi tin nhắn
    const senderID = localStorage.getItem("uid");  // ID người gửi

    if (type === "text") {
        addTextMessageToChatBox(content, senderID);  // Thêm tin nhắn vào chat box

    } else if (type === "image") {
        const files = document.getElementById('attachment').files;
        const file = files[0];  // Giả sử chỉ lấy tệp đầu tiên nếu có nhiều tệp
        const imageUrl = URL.createObjectURL(file);
        addImageMessageToChatBox(imageUrl, senderID);  // Gọi hàm để hiển thị hình ảnh

    } else if (type === "video") {
        const files = document.getElementById('attachment').files;
        const file = files[0];  // Giả sử chỉ lấy tệp video đầu tiên
        const videoUrl = URL.createObjectURL(file);
        addVideoMessageToChatBox(videoUrl, senderID);  // Gọi hàm để hiển thị video

    } else if (type === "file") {
        const files = document.getElementById('attachment').files;
        const file = files[0];  // Giả sử chỉ lấy tệp tài liệu đầu tiên
        const fileName = file.name;
        const fileSize = file.size;
        const fileSubtype = file.type;  // Loại tệp (ví dụ: application/pdf, application/msword, ...)
        addFileMessageToChatBox(fileName, fileSize, fileSubtype, senderID);  // Gọi hàm để hiển thị tệp tài liệu

    } else if (type === "link") {
        getHyperlinkInfo(content).then((data) => {
            const title = data.title;  // Tiêu đề của trang web
            const description = data.description;  // Mô tả của trang web
            const thumbnail = data.thumbnail;  // Hình thu nhỏ của trang web
            const url = data.url;  // Đường dẫn đến trang web
            addLinkMessageToChatBox(title, description, thumbnail, url, senderID, timeSend, replyTo);  // Thêm tin nhắn link vào chat box
        });

    } else if (type === "rich-text") {
        addRichTextMessageToChatBox(content, senderID, timeSend, replyTo);  // Thêm tin nhắn rich text vào chat box

    } else {
        console.warn("Loại tin nhắn không xác định:", type);
    }

    const tempMessage = {
        senderID: senderID,
        timeSend: new Date(),
        type: type,
        replyTo: "",
        content: {
            text: content
        }
    }

    fixMessageToChatBoxList(sessionStorage.getItem("lastClickedUser"), tempMessage);  // Sửa đổi tin nhắn trong chat box danh sách
    document.getElementById("message-input").value = '';
}

function addTimestampToMessage(messageDiv, timeSend) {
    const timeElement = document.createElement("span");
    timeElement.classList.add("message-time");

    // Format the time
    const date = new Date(timeSend);
    timeElement.textContent = formatRelativeTimeRead(date);
    timeElement.style.fontSize = '12px';
    timeElement.style.color = '#888';
    timeElement.style.marginLeft = '8px';

    messageDiv.appendChild(timeElement);
}

function addTextMessageToChatBox(textMessage, senderID, type, timeSend, reply) {
    const container = document.getElementById("messageContainer");
    const div = document.createElement("div");
    const p = document.createElement("p");

    if (type === "system") {
        div.classList.add("message-content", "systemMessage");
    } else {
        div.classList.add("message-content", "messageText");
    }

    if (localStorage.getItem("uid") === senderID) {
        div.classList.add("sender");
    }

    // Create message content
    p.textContent = textMessage;
    div.appendChild(p);

    // Add a timestamp if provided
    if (timeSend) {
        addTimestampToMessage(div, timeSend);
    }

    container.appendChild(div);
}

function addImageMessageToChatBox(urlImage, senderID) {
    const messageContainer = document.querySelector('.message-container-body-message-area');

    const div = document.createElement('div');
    div.classList.add('message-content', 'sender', 'messageImage');

    const img = document.createElement('img');
    img.src = urlImage;
    img.style.maxWidth = '200px';
    img.alt = `Ảnh: ${senderID}`;

    div.appendChild(img);

    // Thêm thông tin người gửi
    const metaInfo = document.createElement('p');
    metaInfo.classList.add('messageMeta');
    metaInfo.innerHTML = `${senderID}`;
    div.appendChild(metaInfo);

    messageContainer.appendChild(div);
}


function addVideoMessageToChatBox(urlVideo, senderID) {
    const messageContainer = document.querySelector('.message-container-body-message-area');

    const div = document.createElement('div');
    div.classList.add('message-content', 'sender', 'messageVideo');

    const video = document.createElement('video');
    video.src = urlVideo;
    video.controls = true;
    video.muted = true;
    video.style.maxWidth = '200px';

    div.appendChild(video);

    // Thêm thông tin người gửi
    const metaInfo = document.createElement('p');
    metaInfo.classList.add('messageMeta');
    metaInfo.innerHTML = `${senderID}`;
    div.appendChild(metaInfo);

    messageContainer.appendChild(div);
}

function addFileMessageToChatBox(fileName, size, subtype, senderID) {
    const messageContainer = document.querySelector('.message-container-body-message-area');

    const div = document.createElement('div');
    div.classList.add('message-content', 'sender', 'messageFile');

    const icon = document.createElement('i');
    icon.classList.add('fa-solid', 'fa-file-lines');
    icon.setAttribute('aria-label', `File: ${fileName}`);

    const p = document.createElement('p');
    const fileSize = size < 1024 * 1024
        ? `${(size / 1024).toFixed(2)} KB`
        : `${(size / (1024 * 1024)).toFixed(2)} MB`;
    p.innerHTML = `${fileName} (${subtype})<br>${fileSize}`;

    div.appendChild(icon);
    div.appendChild(p);

    // Thêm thông tin người gửi
    const metaInfo = document.createElement('p');
    metaInfo.classList.add('messageMeta');
    metaInfo.innerHTML = `${senderID}`;
    div.appendChild(metaInfo);

    // Thêm sự kiện click để tải tệp về
    div.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([size]));  // Tạo URL từ dữ liệu nhị phân
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    messageContainer.appendChild(div);
}


function addLinkMessageToChatBox(title, description, thumbnail, url, senderID, timeSend, reply) {
    // Tạo một div chứa thông tin tin nhắn
    const div = document.createElement('div');
    div.classList.add('message-content', 'sender', 'messageLink');

    // Thêm thông tin về người gửi và thời gian gửi
    const header = document.createElement('div');
    header.classList.add('message-header');
    const sender = document.createElement('span');
    sender.classList.add('sender-name');
    sender.textContent = senderID;
    const time = document.createElement('span');
    time.classList.add('message-time');
    time.textContent = timeSend;

    header.appendChild(sender);
    header.appendChild(time);
    div.appendChild(header);

    // Thêm thumbnail nếu có
    if (thumbnail) {
        const img = document.createElement('img');
        img.src = thumbnail;
        img.alt = 'Thumbnail';
        img.classList.add('thumbnail');
        div.appendChild(img);
    }

    // Thêm tiêu đề và mô tả
    const content = document.createElement('div');
    content.classList.add('message-content-body');

    const linkTitle = document.createElement('h4');
    linkTitle.textContent = title;
    content.appendChild(linkTitle);

    const linkDescription = document.createElement('p');
    linkDescription.textContent = description;
    content.appendChild(linkDescription);

    // Thêm URL và style cho liên kết
    const link = document.createElement('a');
    link.href = url;
    link.textContent = url;
    link.target = '_blank';  // Mở liên kết trong tab mới
    content.appendChild(link);

    // Nếu có reply thì hiển thị phần này
    if (reply) {
        const replyMessage = document.createElement('div');
        replyMessage.classList.add('reply-message');
        replyMessage.textContent = `Reply: ${reply}`;
        div.appendChild(replyMessage);
    }

    // Thêm tất cả vào container chat
    div.appendChild(content);

    // Đưa tin nhắn vào container
    const messageContainer = document.querySelector('.message-container-body-message-area');
    messageContainer.appendChild(div);
}

function addRichTextMessageToChatBox(rich_text, senderID, timeSend, reply) {
    const messageContainer = document.querySelector('.message-container-body-message-area'); // Chọn nơi hiển thị message

    // Tạo div chứa tin nhắn
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message-content', 'sender');

    // Tạo thẻ <p> chứa nội dung
    const p = document.createElement('p');
    p.innerHTML = rich_text; // Sử dụng innerHTML để hiển thị HTML (vì chứa các thẻ <a> và emoji)

    // Thêm thời gian gửi (nếu cần) vào message
    const timeSpan = document.createElement('span');
    timeSpan.classList.add('message-time');
    timeSpan.textContent = timeSend; // Thời gian gửi

    // Thêm mọi thứ vào messageDiv
    messageDiv.appendChild(p);
    messageDiv.appendChild(timeSpan);

    // Thêm messageDiv vào container chat
    messageContainer.appendChild(messageDiv);
}

function convertContentToString(content) {
    return content.map(item => {
        if (item.type === 'text') {
            return item.text; // Trả về text thuần túy
        } else if (item.type === 'link') {
            return item.text; // Chỉ giữ lại phần text của link
        } else if (item.type === 'emoji') {
            return item.unicode; // Trả về emoji
        }
        return ''; // Nếu không phải loại hợp lệ, trả về chuỗi trống
    }).join(''); // Kết hợp thành một chuỗi duy nhất
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

export {
    addMessageToChatBoxClient,
    addMessageToChatBoxServer,
    fixMessageToChatBoxList,
    isRichText
};

