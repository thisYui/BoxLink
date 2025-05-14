
// Hàm di chuyển chatID lên đầu listChatBoxID
function moveChatIDToFristInListBox(chatID) {
    // Tìm vị trí của chatID trong danh sách
    const index = listChatBoxID.indexOf(chatID);

    // Nếu chatID tồn tại trong danh sách
    if (index !== -1) {
        // Lấy phần tử chatID ra khỏi danh sách
        listChatBoxID.splice(index, 1);

        // Đưa chatID lên đầu danh sách
        listChatBoxID.unshift(chatID);

        // Tìm phần tử tương ứng trong DOM
        const chatBox = document.getElementById(chatID);

        // Di chuyển phần tử chatBox lên đầu
        const chatsContainer = document.querySelector(".chat-box-area");
        chatsContainer.prepend(chatBox); // Di chuyển chatBox lên đầu
    }
}


function addBoxChatToList(chatData) {
    const friendName = chatData.displayName; // Tên bạn bè
    const friendID = chatData.uid; // ID bạn bè
    const friendAvatar = chatData.avatar; // URL ảnh đại diện bạn bè
    const text = chatData.lastMessage.text; // Tin nhắn cuối cùng
    const timeSend = chatData.lastMessage.timeSend; // Thời gian gửi tin nhắn
    const timeSeen = chatData.lastMessage.timeSeen; // Thời gian đã đọc tin nhắn
    const lastOnline = chatData.lastOnline; // Thời gian cuối cùng online

    const chatsContainer = document.querySelector(".chat-box-area");
    const div = document.createElement('div');
    div.classList.add('chat-box-area-box');
    div.id = friendID;
    const img = document.createElement('img');
    img.src = friendAvatar;
    img.classList.add('chat-box-avatar');

    const containBox = document.createElement('div');
    containBox.classList.add('chat-box-contain');

    const name = document.createElement('h4');
    name.classList.add('displayName');
    name.textContent = friendName;

    const lastestMessage = document.createElement('p');
    lastestMessage.classList.add('lastest-chat');
    lastestMessage.textContent = text;

    containBox.appendChild(name);
    containBox.appendChild(lastestMessage);
    div.appendChild(img);
    div.appendChild(containBox);
    chatsContainer.appendChild(div);


    // lastOnline để hiện trạng thái online hay thời gian hoạt động gần đây nhất
    // nếu timeSend === timeSeen thì hiện là đã đọc
    // nếu timeSend !== timeSeen thì hiện là chưa đọc in đậm lên
}

// Thêm 1 tin nhắn vào đoạn chat
function addMessageToChatBoxList(message) {
    const senderID = message.senderId;  // ID người gửi
    const timeSend = message.timeSend;  // Thời gian gửi tin nhắn
    const type = message.type;  // Kiểu tin nhắn (text, image, video, file)
    const reply = message.replyTo;  // Tin nhắn trả lời (nếu có)
    let textMessage = "";

    if (senderID === localStorage.getItem("uid")) {
        textMessage = "Bạn: "
    }

    if (reply !== "") {
        textMessage += "Đã trả lời một tin nhắn."
    } else if (type === "text" || type === "system" || type === "link" || type === "rich-text") {
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

    addContentTextMessageToChatBoxList(senderID, textMessage, timeSend);  // Thêm tin nhắn vào chat box
}

// Thêm tin nhắn hiển thị phía chat list
function addContentTextMessageToChatBoxList(id, text, timeSend) {
    // Tìm kiếm đoạn chat dựa trên senderID
    // const senderID = msg.senderId;

    // Đẩy thông báo lên đầu danh sách
    // nếu it khcas ới id chat đang mở thì tô đen
}


export {
    moveChatIDToFristInListBox,
    addBoxChatToList,
    addMessageToChatBoxList,
}