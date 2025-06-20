import { getHyperlinkInfo } from '../fetchers/request.js';
import { fixMessageToChatBoxList, moveChatIDToFirstInListBox} from './chatProcessor.js';
import { isURL, formatRelativeTimeSend, convertToDate } from "../utils/renderData.js";

// Chỉ dùng cho server
function addMessageToChatBoxServer(message) {
    const messageID = message.messageID; // ID của tin nhắn
    const senderID = message.senderID;  // ID người gửi
    const timeSend = convertToDate(message.timestamp);  // Thời gian gửi tin nhắn
    const type = message.type;  // Kiểu tin nhắn (text, image, video, file)
    const reply = message.replyTo;  // Tin nhắn trả lời (nếu có)
    const content = message.content;  // Nội dung tin nhắn

    if (type === "system" || type === "text") {
        const textMessage = content.text;  // Nội dung tin nhắn văn bản
        addTextMessageToChatBox(messageID, textMessage, senderID, type, timeSend, reply);  // Thêm tin nhắn vào chat box

    } else if (type === "image") {
        const urlImage = content.url;  // Đường dẫn đến ảnh
        addImageMessageToChatBox(messageID, urlImage, senderID, timeSend, reply);  // Thêm tin nhắn ảnh vào chat box

    } else if (type === "video") {
        const urlVideo = content.url;  // Đường dẫn đến video
        const duration = content.duration;  // Thời gian video
        addVideoMessageToChatBox(messageID, urlVideo, duration, senderID, timeSend, reply);  // Thêm tin nhắn video vào chat box

    } else if (type === "application") {
        const fileName = content.fileName;  // Tên tệp
        const size = content.size;  // Kích thước tệp
        const subtype = content.subtype;  // Loại tệp (file, audio)
        addFileMessageToChatBox(messageID, fileName, size, subtype, senderID, timeSend, reply);  // Thêm tin nhắn tệp vào chat box

    } else if (type === "link") {
        const title = content.title;  // Tiêu đề của trang web
        const description = content.description;  // Mô tả của trang web
        const thumbnail = content.thumbnail;  // Hình thu nhỏ của trang web
        const url = content.url;  // Đường dẫn đến trang web
        addLinkMessageToChatBox(messageID, title, description, thumbnail, url, senderID, timeSend, reply);  // Thêm tin nhắn link vào chat box

    } else if (type === "rich-text") {
        const richText = convertContentToString(content);  // Chuyển đổi nội dung rich text thành chuỗi
        addRichTextMessageToChatBox(messageID, richText, senderID, timeSend, reply);  // Thêm tin nhắn rich text vào chat box

    } else {
        console.warn("Loại tin nhắn không xác định:", type);
    }
}

// Chỉ dùng cho client
function addMessageToChatBoxClient(messageID, type, content, replyTo) {
    moveChatIDToFirstInListBox(sessionStorage.getItem("lastClickedUser"));  // Di chuyển đoạn chat của người gửi lên đầu danh sách

    const timeSend = new Date();  // Thời gian gửi tin nhắn
    const senderID = localStorage.getItem("uid");  // ID người gửi

    if (type === "text") {
        addTextMessageToChatBox(messageID, content, senderID, type, timeSend, replyTo);  // Thêm tin nhắn vào chat box

    } else if (type === "image") {
        const files = document.getElementById('attachment').files;
        const file = files[0];  // Giả sử chỉ lấy tệp đầu tiên nếu có nhiều tệp
        const imageUrl = URL.createObjectURL(file);
        addImageMessageToChatBox(messageID, imageUrl, senderID, timeSend, replyTo);  // Gọi hàm để hiển thị hình ảnh

    } else if (type === "video") {
        const files = document.getElementById('attachment').files;
        const file = files[0];  // Giả sử chỉ lấy tệp video đầu tiên
        const videoUrl = URL.createObjectURL(file);
        addVideoMessageToChatBox(messageID, videoUrl, senderID, timeSend, replyTo);  // Gọi hàm để hiển thị video

    } else if (type === "application") { // ở phía server sẽ là file
        const files = document.getElementById('attachment').files;
        const file = files[0];  // Giả sử chỉ lấy tệp tài liệu đầu tiên
        const fileName = file.name;
        const fileSize = file.size;
        const fileSubtype = file.type;  // Loại tệp (ví dụ: application/pdf, application/msword, ...)
        addFileMessageToChatBox(messageID, fileName, fileSize, fileSubtype, senderID, timeSend, replyTo);  // Gọi hàm để hiển thị tệp tài liệu

    } else if (type === "link") {
        getHyperlinkInfo(content).then((data) => {
            const title = data.title;  // Tiêu đề của trang web
            const description = data.description;  // Mô tả của trang web
            const thumbnail = data.thumbnail;  // Hình thu nhỏ của trang web
            const url = data.url;  // Đường dẫn đến trang web
            addLinkMessageToChatBox(messageID, title, description, thumbnail, url, senderID, timeSend, replyTo);  // Thêm tin nhắn link vào chat box
        });

    } else if (type === "rich-text") {
        addRichTextMessageToChatBox(messageID, content, senderID, timeSend, replyTo);  // Thêm tin nhắn rich text vào chat box

    } else {
        console.warn("Loại tin nhắn không xác định:", type);
    }

    const tempMessage = {
        senderID: senderID,
        timestamp: new Date(),
        type: type,
        replyTo: "",
        content: {
            text: content
        }
    }

    fixMessageToChatBoxList(sessionStorage.getItem("lastClickedUser"), tempMessage, true);  // Sửa đổi tin nhắn trong chat box danh sách
    document.getElementById("message-input").value = '';
}

function addTimestampAndReplyToMessage(messageDiv, timeSend, messageID) {
    const timeElement = document.createElement("div");
    timeElement.classList.add("message-time");
    const p = document.createElement("span");
    p.textContent = formatRelativeTimeSend(timeSend);

    // Format the time
    const date = new Date(timeSend);
    timeElement.textContent = formatRelativeTimeSend(date);

    const reply = document.createElement("div");
    reply.classList.add("reply-button");
    reply.id = messageID;

    const i = document.createElement("i");
    i.classList.add("fa-solid", "fa-reply");
    reply.appendChild(i);

    messageDiv.appendChild(timeElement);
    messageDiv.appendChild(reply);
}

function getDataFromMessageID(messageID) {
    const messageContainer = document.getElementById("messageContainer");
    const messageWrapper = messageContainer.querySelector(`[id="${messageID}"]`);

    if (!messageWrapper) {
        // Data quá cũ chưa fetch đến

        return null;
    }

    const messageContent = messageWrapper.querySelector(".message-content");

    if (messageContent.classList.contains('messageImage')) {
        return t("message.send-image");

    } else if (messageContent.classList.contains('messageFile')) {
        return t("message.send-file");

    } else if (messageContent.classList.contains('messageVideo')) {
        return t("message.send-video");

    } else if (messageContent.classList.contains('messageLink')) {
        return t("message.send-link");

    } else {
        const pList = messageContent.querySelectorAll("p");
        const p = pList[pList.length - 1]; // Lấy phần tử <p> cuối cùng
        return p.textContent;
    }
}

function addMessageWrapper(messageWrapper, div, messageID, senderID, timeSend) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message-meta");

    if (localStorage.getItem("uid") === senderID) {
        messageWrapper.classList.add("sender");
        messageDiv.style.alignItems = 'flex-end';

        addTimestampAndReplyToMessage(messageDiv, timeSend, messageID);

        messageWrapper.appendChild(messageDiv);
        messageWrapper.appendChild(div);

    } else {
        messageDiv.style.alignItems = 'flex-start';

        addTimestampAndReplyToMessage(messageDiv, timeSend, messageID);

        messageWrapper.appendChild(div);
        messageWrapper.appendChild(messageDiv);
    }
}

function addReplyToMessageContent(messageContent, reply) {
    const replyDiv = document.createElement("div");
    replyDiv.classList.add("message-reply-source");

    const lineDiv = document.createElement("div");
    lineDiv.classList.add("vertical-line")
    replyDiv.appendChild(lineDiv);

    const p = document.createElement("p");
    p.textContent = getDataFromMessageID(reply); // Lấy nội dung tin nhắn từ messageID
    replyDiv.appendChild(p);

    messageContent.appendChild(replyDiv);
}

function addTextMessageToChatBox(messageID, textMessage, senderID, type, timeSend, reply) {
    const container = document.getElementById("messageContainer");
    const messageWrapper = document.createElement("div")
    messageWrapper.classList.add("message-wrapper");
    messageWrapper.id = messageID; // Thêm ID cho messageWrapper để nhận diện

    const div = document.createElement("div");
    div.classList.add("message-content");

    if (reply !== "") {
        addReplyToMessageContent(div, reply); // Thêm phần trả lời nếu có
    }

    const p = document.createElement("p");
    p.textContent = textMessage;
    div.appendChild(p);

    if (type === "system") {
        div.classList.add("systemMessage");
        messageWrapper.classList.add("systemMessage");

    } else {
        div.classList.add("messageText");

        // Thêm wrapper
        addMessageWrapper(messageWrapper, div, messageID, senderID, timeSend); // Thêm messageDiv và div vào messageWrapper
    }

    container.appendChild(messageWrapper);
}

function addImageMessageToChatBox(messageID, urlImage, senderID, timeSend, reply) {
    const container = document.getElementById("messageContainer");
    const messageWrapper = document.createElement("div")
    messageWrapper.classList.add("message-wrapper");
    messageWrapper.id = messageID; // Thêm ID cho messageWrapper để nhận diện

    const div = document.createElement('div');
    div.classList.add('message-content', 'messageImage');

    // Thêm reply nếu có
    if (reply !== "") {
        addReplyToMessageContent(div, reply);
    }

    // Container for responsive image sizing
    // This allows images to be flexible while maintaining constraints
    const imgContainer = document.createElement('div');
    imgContainer.classList.add('image-container');
    imgContainer.style.maxWidth = '300px'; // Maximum width to prevent oversized images
    imgContainer.style.minWidth = '100px'; // Minimum width to ensure visibility
    imgContainer.style.width = 'auto';

    const img = document.createElement('img');
    img.src = urlImage;
    img.style.width = '100%';
    img.style.height = 'auto';
    img.style.objectFit = 'contain';
    img.style.cursor = 'pointer';

    // Add click event to view image in full size
    // This creates a modal overlay that displays the image at a larger size
    // Users can click anywhere on the overlay to close it
    img.addEventListener('click', () => {
        // Create a full-screen overlay for the image
        const fullImg = document.createElement('div');
        fullImg.style.position = 'fixed';
        fullImg.style.top = '0';
        fullImg.style.left = '0';
        fullImg.style.width = '100%';
        fullImg.style.height = '100%';
        fullImg.style.backgroundColor = 'rgba(0,0,0,0.8)'; // Semi-transparent black background
        fullImg.style.display = 'flex';
        fullImg.style.justifyContent = 'center';
        fullImg.style.alignItems = 'center';
        fullImg.style.zIndex = '1000'; // Ensure it appears above other elements

        const largeImg = document.createElement('img');
        largeImg.src = urlImage;
        largeImg.style.maxWidth = '90%';
        largeImg.style.maxHeight = '90%';
        largeImg.style.objectFit = 'contain';

        fullImg.appendChild(largeImg);

        fullImg.addEventListener('click', () => {
            document.body.removeChild(fullImg);
        });

        document.body.appendChild(fullImg);
    });

    imgContainer.appendChild(img);
    div.appendChild(imgContainer);

    addMessageWrapper(messageWrapper, div, messageID, senderID, timeSend); // Thêm messageDiv và div vào messageWrapper

    container.appendChild(messageWrapper);
}

function addVideoMessageToChatBox(messageID, urlVideo, senderID, timeSend, reply) {
    const container = document.getElementById("messageContainer");
    const messageWrapper = document.createElement("div")
    messageWrapper.classList.add("message-wrapper");
    messageWrapper.id = messageID; // Thêm ID cho messageWrapper để nhận diện

    const div = document.createElement('div');
    div.classList.add('message-content', 'messageVideo');

    // Thêm reply nếu có
    if (reply !== "") {
        addReplyToMessageContent(div, reply);
    }

    const video = document.createElement('video');
    video.src = urlVideo;
    video.controls = true;
    video.muted = true;
    video.style.maxWidth = '200px';

    div.appendChild(video);

    // Thêm wrapper
    addMessageWrapper(messageWrapper, div, messageID, senderID, timeSend);

    // Đưa tin nhắn vào container
    container.appendChild(messageWrapper);
}

function addFileMessageToChatBox(messageID, fileName, size, subtype, senderID, timeSend, reply) {
    const container = document.getElementById("messageContainer");
    const messageWrapper = document.createElement("div")
    messageWrapper.classList.add("message-wrapper");
    messageWrapper.id = messageID; // Thêm ID cho messageWrapper để nhận diện

    const div = document.createElement('div');
    div.classList.add('message-content', 'messageFile');

    // Thêm reply nếu có
    if (reply !== "") {
        addReplyToMessageContent(div, reply);
    }

    const icon = document.createElement('i');
    icon.classList.add('fa-solid', 'fa-file-lines');
    icon.setAttribute('aria-label', `File: ${fileName}`);

    const p = document.createElement('p');
    const fileSize = size < 1024 * 1024
        ? `${(size / 1024).toFixed(2)} KB`
        : `${(size / (1024 * 1024)).toFixed(2)} MB`;
    p.innerHTML = `${fileName}<br>${fileSize}`;

    div.appendChild(icon);
    div.appendChild(p);

    // Thêm sự kiện click để tải tệp về
    div.addEventListener('click', () => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(new Blob([size]));  // Tạo URL từ dữ liệu nhị phân
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Thêm wrapper
    addMessageWrapper(messageWrapper, div, messageID, senderID, timeSend);

    // Đưa tin nhắn vào container
    container.appendChild(messageWrapper);
}

function addLinkMessageToChatBox(messageID, title, description, thumbnail, url, senderID, timeSend, reply) {
    const container = document.getElementById("messageContainer");
    const messageWrapper = document.createElement("div")
    messageWrapper.classList.add("message-wrapper");
    messageWrapper.id = messageID; // Thêm ID cho messageWrapper để nhận diện

    const div = document.createElement('div');
    div.classList.add('message-content', 'messageLink');

    // Thêm reply nếu có
    if (reply !== "") {
        addReplyToMessageContent(div, reply);
    }

    // Thêm thumbnail nếu có
    if (thumbnail) {
        // Container for responsive thumbnail sizing
        // This allows thumbnails to be flexible in size while maintaining constraints
        const imgContainer = document.createElement('div');
        imgContainer.classList.add('thumbnail-container');
        imgContainer.style.maxWidth = '250px'; // Maximum width to prevent oversized thumbnails
        imgContainer.style.minWidth = '100px'; // Minimum width to ensure visibility
        imgContainer.style.width = 'auto';
        imgContainer.style.marginBottom = '8px'; // Space between thumbnail and content

        const img = document.createElement('img');
        img.src = thumbnail;
        img.alt = 'Thumbnail';
        img.classList.add('thumbnail');
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.objectFit = 'contain';
        img.style.cursor = 'pointer';

        // Add click event to view thumbnail in full size
        // This creates a modal overlay that displays the thumbnail at a larger size
        // Users can click anywhere on the overlay to close it
        img.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent link click when clicking on thumbnail

            // Create a full-screen overlay for the thumbnail
            const fullImg = document.createElement('div');
            fullImg.style.position = 'fixed';
            fullImg.style.top = '0';
            fullImg.style.left = '0';
            fullImg.style.width = '100%';
            fullImg.style.height = '100%';
            fullImg.style.backgroundColor = 'rgba(0,0,0,0.8)'; // Semi-transparent black background
            fullImg.style.display = 'flex';
            fullImg.style.justifyContent = 'center';
            fullImg.style.alignItems = 'center';
            fullImg.style.zIndex = '1000'; // Ensure it appears above other elements

            const largeImg = document.createElement('img');
            largeImg.src = thumbnail;
            largeImg.style.maxWidth = '90%';
            largeImg.style.maxHeight = '90%';
            largeImg.style.objectFit = 'contain';

            fullImg.appendChild(largeImg);

            fullImg.addEventListener('click', () => {
                document.body.removeChild(fullImg);
            });

            document.body.appendChild(fullImg);
        });

        imgContainer.appendChild(img);
        div.appendChild(imgContainer);
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

    div.appendChild(content);

    // Thêm wrapper
    addMessageWrapper(messageWrapper, div, messageID, senderID, timeSend);

    // Đưa tin nhắn vào container
    container.appendChild(messageWrapper);
}

function addRichTextMessageToChatBox(messageID, rich_text, senderID, timeSend, reply) {
    const container = document.getElementById("messageContainer");
    const messageWrapper = document.createElement("div")
    messageWrapper.classList.add("message-wrapper");
    messageWrapper.id = messageID; // Thêm ID cho messageWrapper để nhận diện

    const div = document.createElement('div');
    div.classList.add('message-content', 'messageRichText');

    // Thêm reply nếu có
    if (reply !== "") {
        addReplyToMessageContent(div, reply);
    }

    // Tạo thẻ <p> chứa nội dung
    const p = document.createElement('p');

    // Đưa nội dung rich text vào thẻ <p>
    const wordsArray = rich_text.split(' ');
    wordsArray.forEach(word => {
        // Kiểm tra nếu từ là một liên kết
        if (isURL(word)) {
            const link = document.createElement('a');
            link.href = word;
            link.textContent = word;
            link.target = '_blank';  // Mở liên kết trong tab mới
            p.appendChild(link);

        } else {
            // Nếu không phải liên kết, thêm từ vào thẻ <p>
            const textNode = document.createTextNode(word + ' ');
            p.appendChild(textNode);
        }
    });

    div.appendChild(p);

    // Thêm wrapper
    addMessageWrapper(messageWrapper, div, messageID, senderID, timeSend);

    // Đưa tin nhắn vào container
    container.appendChild(messageWrapper);
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

// Hiện tin nhắn đang được chọn để rep
window.loadMessageRelyTo = function (messageID) {
    const replyToMessageContainer = document.getElementById("replyMessageContainer");
    replyToMessageContainer.classList.remove("hidden");

    const replyUsername = document.getElementById("replyUserName");
    const h = replyUsername.querySelector("h4");
    h.textContent = t("message.replying") + sessionStorage.getItem("friendName");

    const replyMessageText = replyToMessageContainer.querySelector(".reply-message-text")
    replyMessageText.textContent = getDataFromMessageID(messageID); // Lấy nội dung tin nhắn từ messageID
}

export {
    addMessageToChatBoxClient,
    addMessageToChatBoxServer,
    fixMessageToChatBoxList
};