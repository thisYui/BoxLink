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

    const chatsContainer = document.querySelector(".chats-list");

    const div = document.createElement('div');
    div.classList.add('chats-list-user');
    div.id = friendID;

    //Avatar
    const avatar = document.createElement('img');
    avatar.src = friendAvatar;
    avatar.classList.add('chats-list-user-avatar');

    //Content div
    const contentDiv = document.createElement('div');
    contentDiv.classList.add('chats-list-user-content')
    if (isOnline(lastOnline)) {
        contentDiv.classList.add('chats-list-user-content-is-online');
    }

    console.log(lastOnline);

    //Name
    const h4 = document.createElement('h4');
    h4.textContent = friendName;
    h4.classList.add('chats-list-user-name');

    //message
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('chats-list-user-message');
    const lastMessageP = document.createElement('p');
    lastMessageP.classList.add('chats-list-user-text');
    const lastMessageTime = document.createElement('p');
    lastMessageTime.classList.add('chats-list-user-time');
    lastMessageP.textContent = text;
    lastMessageTime.textContent = " - " + formatRelativeTimeRead(timeSend);
    messageDiv.appendChild(lastMessageP);
    messageDiv.appendChild(lastMessageTime);
    contentDiv.appendChild(h4);
    contentDiv.appendChild(messageDiv);
    div.appendChild(avatar);
    div.appendChild(contentDiv);
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

function isOnline(inputDate) {
    const now = new Date();
    const date = new Date(inputDate);
    const diffMs = now - date;

    // Kiểm tra xem thời gian khác nhau có nhỏ hơn 2 phút không
    return diffMs < 2 * 60 * 1000; // 2 phút
}

export {
    fixMessageContainer,
    moveChatIDToFirstInListBox,
    addBoxChatToList,
    fixMessageToChatBoxList,
    updateSeenMessage
}