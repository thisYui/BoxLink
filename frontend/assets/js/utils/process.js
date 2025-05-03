import { searchFriend, getAvatar } from '../fetchers/request.js';
import { getSingleMessage } from '../fetchers/chat.js';

window.processingNotification = async function (notification) {
    // Xử lí theo loại notification
    const { typeNotification, srcID, text} = notification;  // text chứa id document
    console.log("Notification type:", typeNotification);
    console.log("Notification srcID:", srcID);
    console.log("Notification text:", text);

    if (typeNotification === "message") {
        // Theo srcID để tìm ra người gửi lấy thông tin
        const msg = await getSingleMessage(srcID, text);  // text chứa id document

        // viết đoạn sau thành hàm tương ứng
        console.log("Message received:", msg);

        // Đưa tin nhắn vào chat cho 2 trường hợp
        if (msg.senderId === window.lastClickedUser) {
            // 1. Nếu chat là chat đang mở
            addMessageToChatBox(msg.content.text);  // Thêm tin nhắn vào chat box
        } else {
            // 2. Nếu chat không phải là chat đang mở
            // Tìm kiếm đoạn chat dựa trên senderID
            // const senderID = msg.senderId;

            // Đẩy thông báo lên đầu danh sách
            // Tô đen
        }

    } else if (typeNotification === "friend-request"
            || typeNotification === "friend-accept") {
        // Lấy các thông tin và đưa lên thông báo
        await searchFriend(srcID).then((friend) => {
            const displayName = friend.displayName; // Tên bạn bè
            const email = friend.email; // Email bạn bè
            const avatarUrl = friend.avatar; // URL ảnh đại diện bạn bè
            const status = friend.status; // Trạng thái bạn bè

            // processing
            // đưa lênh thanh thông báo với dạng tựa hệt như thanh tìm kiếm
            // Lưu lại các thông tin trên vì sẽ ko load lại
        });
    } else if (typeNotification === "update-avatar") {
        // Lấy avatar mới từ srcID
        const { avatarUrl } = await getAvatar(srcID);  // là 1 link url

        // Cập nhật lại avatar
    }
}

// Thêm 1 tin nhắn vào đoạn chat
function addMessageToChatBox(textMessage) {
    const container = document.getElementById("messageContainer");
    const div = document.createElement("div");
    const p = document.createElement("p");
    div.classList.add("message-content", "sender", "messageText");
    p.textContent = textMessage;
    div.appendChild(p);
    container.appendChild(div);
    document.getElementById("message-input").value = '';
}

export {
    addMessageToChatBox
};