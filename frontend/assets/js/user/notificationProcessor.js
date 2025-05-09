import { getSingleMessage } from "../fetchers/chatFetcher";
import { getAvatar, searchFriend } from "../fetchers/request";
import { addMessageToChatBoxServer } from "../utils/renderMessage.js";

window.processingNotification = async function (notification) {
    // Xử lí theo loại notification
    const { typeNotification, srcID, text} = notification;  // text chứa id document
    console.log("Notification type:", typeNotification);
    console.log("Notification srcID:", srcID);
    console.log("Notification text:", text);

    if (typeNotification === "message") {
        // Theo srcID để tìm ra người gửi lấy thông tin
        const msg = await getSingleMessage(srcID, text);  // text chứa id document

        // Đưa tin nhắn vào chat cho 2 trường hợp
        if (msg.senderId === window.lastClickedUser) {
            // 1. Nếu chat là chat đang mở
            addMessageToChatBoxServer(msg);  // Thêm tin nhắn vào chat box
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

        // Cập nhật lại avatar của srcID
        // Tìm kiếm srcID
        // thay src = avatarUrl
    }
}

// Thêm 1 thông báo vào danh sách thông báo
function addNotificationToList(type, content) {

}

// Xóa 1 thông báo khỏi danh sách thông báo
function removeNotificationFromList(notificationId) {

}

// Thay đổi số lượng thông báo chưa đọc (dấu chấm đỏ trên biểu tượng thông báo)
function updateUnreadCount(count) {

}