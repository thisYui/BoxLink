import { convertToDate, formatRelativeTimeRead, formatRelativeTimeOnline, isOnline } from '../utils/renderData.js'

// Dùng để truyền thông tin người dùng từ chat-list sáng message-container
function transmitMessageContainer(chatID) {
    // Find the chat box for this user
    const chatContainer = document.getElementById("chatContainer");
    const box = chatContainer.querySelector(`[id="${chatID}"]`);
    if (!box) return;

    // Get user information from the box
    const name = box.querySelector('.chats-list-user-name').textContent;
    const avatar = box.querySelector('.chats-list-user-avatar').src;
    const stringTimeOnline = box.querySelector('.chats-list-user-content').dataset.date;
    const timeOnline = new Date(stringTimeOnline);

    // Get header elements
    const messageContainer = document.getElementById("messageGroupContainer");
    const displayNameElement = messageContainer.querySelector('.chat-info-display-name');
    const lastSeenElement = messageContainer.querySelector('.chat-info-display-actived');
    const avatarElement = messageContainer.querySelector('.chat-info-avatar');

    // Update avatar
    if (avatar) {
        avatarElement.src = avatar;
        avatarElement.alt = name;

        avatarElement.addEventListener('click', async () => {
            await chooseUserItem(chatID);
        });
    }

    // Update display name
    if (name) {
        displayNameElement.textContent = name;
        sessionStorage.setItem("friendName", name);
    }

    if (timeOnline) {
        lastSeenElement.textContent = formatRelativeTimeOnline(timeOnline);
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

    const chatContainer = document.getElementById("messageContainer");
    const chatBox = chatContainer.querySelector(`[id="${chatID}"]`);
    const chatsContainer = document.querySelector(".chats-list");
    if (chatBox && chatsContainer) {
        chatsContainer.prepend(chatBox);
    }
}

function addBoxChatToList(chatData) {
    const friendName = chatData.displayName;
    const friendID = chatData.uid;
    const friendAvatar = chatData.avatar;
    const text = chatData.lastMessage.text;
    const senderID = chatData.lastMessage.senderID;
    const timeSend = convertToDate(chatData.lastMessage.timeSend);
    const timeSeen = convertToDate(chatData.lastMessage.timeSeen);
    const clientTimeSeen = convertToDate(chatData.lastMessage.clientTimeSeen);
    const lastOnline = convertToDate(chatData.lastOnline);

    const formattedTime = formatRelativeTimeRead(timeSend);
    const isSeen = senderID === localStorage.getItem('uid') && timeSeen >= timeSend;

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

    contentDiv.classList.add('chats-list-user-content');
    contentDiv.dataset.date = lastOnline.toISOString();
    if (isOnline(lastOnline)) {
        contentDiv.classList.add('chats-list-user-content-is-online');
    }

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

    lastMessageP.textContent = senderID === localStorage.getItem('uid') ? "Bạn: " + text : text;

    lastMessageTime.textContent = " - " + formattedTime;

    if (!isSeen && senderID !== localStorage.getItem('uid') && clientTimeSeen < timeSend) {
        h4.style.fontWeight = 'bold';
        lastMessageP.style.fontWeight = 'bold';
        lastMessageTime.style.fontWeight = 'bold';
    }

    messageDiv.appendChild(lastMessageP);
    messageDiv.appendChild(lastMessageTime);

    contentDiv.appendChild(h4);
    contentDiv.appendChild(messageDiv);

    div.appendChild(avatar);
    div.appendChild(contentDiv);

    if (isSeen) {
        const seenImage = document.createElement('img');
        seenImage.src = friendAvatar;
        seenImage.classList.add('chats-list-user-seen');
        div.appendChild(seenImage);
    }

    chatsContainer.appendChild(div);
}

// Sửa đổi tin nhắn để hiển thị trong chat box
function fixMessageToChatBoxList(chatID, message, chatOpen) {
    const senderID = message.senderID;  // ID người gửi
    const timeSend = message.timestamp;  // Thời gian gửi tin nhắn
    const type = message.type;  // Kiểu tin nhắn (text, image, video, file)
    const reply = message.replyTo;  // Tin nhắn trả lời (nếu có)
    let textMessage = "";

    moveChatIDToFirstInListBox(senderID);  // Di chuyển chatID lên đầu danh sách

    if (senderID === localStorage.getItem("uid")) {
        textMessage += "Bạn: "
    } else if (reply !== "") {
        textMessage += "Đã trả lời một tin nhắn:"
    }

    if (type === "text" || type === "system" || type === "link" || type === "rich-text") {
        textMessage += message.content.text;  // Nội dung tin nhắn văn bản
    } else if (type === "image") {
        textMessage += "Đã gửi một ảnh.";  // Nội dung tin nhắn ảnh
    } else if (type === "video") {
        textMessage += "Đã gửi một video.";  // Nội dung tin nhắn video
    } else if (type === "application") {
        textMessage += "Đã gửi một tệp đính kèm.";  // Nội dung tin nhắn tệp
    } else {
        console.warn("Loại tin nhắn không xác định:", type);
    }

    fixContentTextMessageToChatBoxList(chatID, senderID, textMessage, timeSend, chatOpen);  // Thêm tin nhắn vào chat box
}

// Thêm tin nhắn hiển thị phía chat list
function fixContentTextMessageToChatBoxList(chatID, senderID, text, timeSend, chatOpen) {
    // Tìm chat box theo ID
    const chatContainer = document.getElementById("messageContainer");
    const chatBox = chatContainer.querySelector(`[id="${chatID}"]`);
    if (!chatBox) return;

    // Định dạng thời gian gửi
    const formattedTime = formatRelativeTimeRead(timeSend);

    // Cập nhật nội dung tin nhắn
    const messageText = chatBox.querySelector('.chats-list-user-text');
    if (messageText) {
        messageText.textContent = text;
    }

    // Cập nhật thời gian tin nhắn
    const messageTime = chatBox.querySelector('.chats-list-user-time');
    if (messageTime) {
        messageTime.textContent = " - " + formattedTime;
    }

    // Chat đang mở hay không
    if (senderID !== localStorage.getItem("uid")) {
        updateOnlineStatus(chatID, timeSend);
    }

    const userName = chatBox.querySelector('.chats-list-user-name');

    // Kiểm tra xem chat box có đang mở không
    if (chatOpen) {
        userName.style.fontWeight = 'normal';
        messageText.style.fontWeight = 'normal';
        messageTime.style.fontWeight = 'normal';

        updateSeenMessageIcon(chatID, senderID !== localStorage.getItem("uid"));

    } else {
        // In đậm tên người gửi và tin nhắn nếu chưa đọc
        userName.style.fontWeight = 'bold';
        messageText.style.fontWeight = 'bold';
        messageTime.style.fontWeight = 'bold';

        updateSeenMessageIcon(chatID, false);
    }
}

function updateSeenMessageIcon(chatID, seen) {
    const chatContainer = document.getElementById("messageContainer");
    const chatBox = chatContainer.querySelector(`[id="${chatID}"]`);
    if (!chatBox) return; // không tìm thấy thì dừng

    // Lấy avatar của người bạn
    const friendAvatar = chatBox.querySelector('.chats-list-user-avatar').src;

    // Cập nhật trạng thái đã xem
    const icon = chatBox.querySelector('.chats-list-user-seen');
    if (!icon && seen) {
        const seenImage = document.createElement('img');
        seenImage.src = friendAvatar;
        seenImage.classList.add('chats-list-user-seen');
        chatBox.appendChild(seenImage);

    } else if (icon && !seen) {
        icon.remove();
    }
}

function updateSeenMessageStyle() {
    const chatContainer = document.getElementById("messageContainer");
    const chatID = sessionStorage.getItem("lastClickedUser");
    const chatBox = chatContainer.querySelector(`[id="${chatID}"]`);
    if (!chatBox) return; // không tìm thấy thì dừng

    // Lấy các phần tử cần thiết
    const userName = chatBox.querySelector('.chats-list-user-name');
    const messageText = chatBox.querySelector('.chats-list-user-text');
    const messageTime = chatBox.querySelector('.chats-list-user-time');

    // Cập nhật kiểu chữ
    userName.style.fontWeight = 'normal';
    messageText.style.fontWeight = 'normal';
    messageTime.style.fontWeight = 'normal';
}

/**
 * @param chatID {string} - ID của chat box
 * @param time {Date} - Thời gian online của người dùng
 */
function updateOnlineStatus(chatID, time) {
    const chatContainer = document.getElementById("messageContainer");
    const chatBox = chatContainer.querySelector(`[id="${chatID}"]`);
    if (!chatBox) return; // không tìm thấy thì dừng

    const contentDiv = chatBox.querySelector('.chats-list-user-content');
    if (contentDiv) {
        if (isOnline(time)) {
            contentDiv.dataset.date = time.toISOString(); // Cập nhật thời gian online
            contentDiv.classList.add('chats-list-user-content-is-online');
        } else {
            contentDiv.classList.remove('chats-list-user-content-is-online');
        }
    }

    const chatOpen = sessionStorage.getItem('chatID') === chatID;
    if (chatOpen) {
        transmitMessageContainer(chatID); // Cập nhật thông tin người dùng trong message container
    }
}

export {
    transmitMessageContainer,
    moveChatIDToFirstInListBox,
    addBoxChatToList,
    fixMessageToChatBoxList,
    updateSeenMessageIcon,
    updateSeenMessageStyle,
    updateOnlineStatus
}
