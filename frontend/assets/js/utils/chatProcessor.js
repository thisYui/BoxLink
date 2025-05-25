import { convertToDate, formatRelativeTimeRead, formatRelativeTimeOnline } from './renderData.js'

function fixMessageContainer(chatID) {
    // Find the chat box for this user
    const box = document.getElementById(chatID);
    if (!box) return;

    // Get user information from the box
    const name = box.querySelector('.displayName').textContent;
    const avatar = box.querySelector('.chat-box-avatar').src;
    const timeOnline = box.querySelector('.friend-status').textContent; // Tooltip chứa thời gian hoạt động

    // Get header elements
    const displayNameElement = document.querySelector('.chat-info-display-name');
    const lastSeenElement = document.querySelector('.chat-info-display-actived');
    const avatarElement = document.getElementById('messageContainerAvatar');

    // Update avatar
    if (avatar) {
        avatarElement.src = avatar;
        avatarElement.alt = name;
    }

    // Update display name
    if (name) {
        displayNameElement.textContent = name;
    }

    if (timeOnline) {
        lastSeenElement.textContent = timeOnline;
    }
}

// Hàm di chuyển chatID lên đầu listChatBoxID
function moveChatIDToFirstInListBox(chatID) {
    if (!Array.isArray(window.listChatBoxOrder)) {
        window.listChatBoxOrder = [];
    }

    const index = window.listChatBoxOrder.indexOf(chatID);
    if (index !== -1) {
        window.listChatBoxOrder.splice(index, 1);
    }
    window.listChatBoxOrder.unshift(chatID);

    const chatBox = document.getElementById(chatID);
    const chatsContainer = document.querySelector(".chat-box-area");
    if (chatBox && chatsContainer) {
        chatsContainer.prepend(chatBox);
    }
}

function addBoxChatToList(chatData) {
    const friendName = chatData.displayName;
    const friendID = chatData.uid;
    const friendAvatar = chatData.avatar;
    const text = chatData.lastMessage.text;
    const senderID = chatData.lastMessage.senderId;
    const timeSend = convertToDate(chatData.lastMessage.timeSend);
    const timeSeen = convertToDate(chatData.lastMessage.timeSeen);
    const lastOnline = convertToDate(chatData.lastOnline);

    const formattedTime = formatRelativeTimeRead(timeSend);
    const formattedLastOnline = formatRelativeTimeOnline(lastOnline);

    const chatsContainer = document.querySelector(".chat-box-area");

    const div = document.createElement('div');
    div.classList.add('chat-box-area-box');
    div.id = friendID;

    const img = document.createElement('img');
    img.src = friendAvatar;
    img.classList.add('chat-box-avatar');

    const containBox = document.createElement('div');
    containBox.classList.add('chat-box-contain');

    // ----------- dòng 1: Tên + Thời gian gửi -----------
    const nameTimeContainer = document.createElement('div');
    nameTimeContainer.style.display = 'flex';
    nameTimeContainer.style.justifyContent = 'space-between';
    nameTimeContainer.style.alignItems = 'flex-start'; // canh trên
    nameTimeContainer.style.width = '100%';             // để 2 bên có không gian

    const name = document.createElement('h4');
    name.classList.add('displayName');
    name.textContent = friendName;

    const timeElement = document.createElement('span');
    timeElement.classList.add('message-time');
    timeElement.textContent = formattedTime;
    timeElement.style.fontSize = '12px';
    timeElement.style.color = '#888';

    nameTimeContainer.appendChild(name);
    nameTimeContainer.appendChild(timeElement);

    // ----------- dòng 2: Trạng thái hoạt động -----------
    const status = document.createElement('span');
    status.classList.add('friend-status');
    status.textContent = formattedLastOnline;
    status.style.fontSize = '12px';
    status.style.color = '#888';
    status.style.margin = '2px 0';

    // ----------- dòng 3: Tin nhắn + trạng thái đọc -----------
    const messageStatusContainer = document.createElement('div');
    messageStatusContainer.style.display = 'flex';
    messageStatusContainer.style.justifyContent = 'space-between';
    messageStatusContainer.style.alignItems = 'flex-start'; // canh trên
    messageStatusContainer.style.width = '100%'; // để 2 bên có không gian

    const lastestMessage = document.createElement('p');
    lastestMessage.classList.add('lastest-chat');
    lastestMessage.textContent = text;

    const readStatus = document.createElement('span');
    readStatus.classList.add('read-status');
    readStatus.style.fontSize = '12px';

    if (timeSend.getTime() === timeSeen.getTime()) {
        readStatus.textContent = window.t('chat.read');
        readStatus.style.color = '#5cb85c';
    } else {
        readStatus.textContent = window.t('chat.unread');
        readStatus.style.color = '#0d6efd';
        lastestMessage.style.fontWeight = 'bold';
    }

    messageStatusContainer.appendChild(lastestMessage);
    messageStatusContainer.appendChild(readStatus);

    // ghép tất cả vào containBox
    containBox.appendChild(nameTimeContainer);
    containBox.appendChild(status);
    containBox.appendChild(messageStatusContainer);

    div.appendChild(img);
    div.appendChild(containBox);
    chatsContainer.appendChild(div);
}

// Thêm 1 tin nhắn vào đoạn chat
function fixMessageToChatBoxList(chatID, message, chatOpen = false) {
    const senderID = message.senderId;  // ID người gửi
    const timeSend = message.timeSend;  // Thời gian gửi tin nhắn
    const type = message.type;  // Kiểu tin nhắn (text, image, video, file)
    const reply = message.replyTo;  // Tin nhắn trả lời (nếu có)
    let textMessage = "";

    moveChatIDToFirstInListBox(senderID);  // Di chuyển chatID lên đầu danh sách

    if (senderID === localStorage.getItem("uid")) {
        textMessage = "Bạn: "
    } else if (reply !== "") {
        textMessage += "Đã trả lời một tin nhắn."
    }

    if (type === "text" || type === "system" || type === "link" || type === "rich-text") {
        textMessage += message.content.text;  // Nội dung tin nhắn văn bản
    } else if (type === "image") {
        textMessage += "Đã gửi một ảnh.";  // Nội dung tin nhắn ảnh
    } else if (type === "video") {
        textMessage += "Đã gửi một video.";  // Nội dung tin nhắn video
    } else if (type === "file") {
        textMessage += "Đã gửi một tệp đính kèm.";  // Nội dung tin nhắn tệp
    } else {
        console.warn("Loại tin nhắn không xác định:", type);
    }

    fixContentTextMessageToChatBoxList(chatID, senderID, textMessage, timeSend,  timeSend, chatOpen);  // Thêm tin nhắn vào chat box
}

// Thêm tin nhắn hiển thị phía chat list
function fixContentTextMessageToChatBoxList(chatID, senderID, text, timeSend, lastOnline, chatOpen) {
    // tìm chat box theo id
    const chatBox = document.getElementById(chatID);
    if (!chatBox) return; // không tìm thấy thì dừng

    // cập nhật thời gian gửi và trạng thái đọc
    const timeElement = chatBox.querySelector('.message-time');
    if (timeElement) {
        timeElement.textContent = formatRelativeTimeRead(timeSend);
    }

    // cập nhật lastOnline (tooltip avatar)
    const avatarImg = chatBox.querySelector('img.chat-box-avatar');
    if (avatarImg) {
        avatarImg.title = `Hoạt động: ${formatRelativeTimeRead(lastOnline)}`;
    }

    // cập nhật nội dung tin nhắn mới
    const lastestMessage = chatBox.querySelector('.lastest-chat');
    if (lastestMessage) {
        lastestMessage.textContent = text;

        // cập nhật kiểu chữ và màu dựa trên đã đọc hay chưa
        const readStatus = chatBox.querySelector('.read-status');
        if (readStatus) {
            if (chatOpen) {
                updateSeenMessage(chatID);
            } else {
                readStatus.textContent = window.t('chat.unread');
                readStatus.style.color = '#0d6efd';
                lastestMessage.style.fontWeight = 'bold';
            }
        }
    }
}

function updateSeenMessage(chatID) {
    const chatBox = document.getElementById(chatID);
    if (!chatBox) return; // không tìm thấy thì dừng

    const lastestMessage = chatBox.querySelector('.lastest-chat');
    const readStatus = chatBox.querySelector('.read-status');

    readStatus.textContent = window.t('chat.read');
    readStatus.style.color = '#5cb85c';
    lastestMessage.style.fontWeight = 'normal';
}

export {
    fixMessageContainer,
    moveChatIDToFirstInListBox,
    addBoxChatToList,
    fixMessageToChatBoxList,
    updateSeenMessage
}