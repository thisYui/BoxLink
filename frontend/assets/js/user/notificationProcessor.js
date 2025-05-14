import { addMessageToChatBoxServer } from '../utils/renderMessage.js';
import { getSingleMessage } from '../fetchers/chatFetcher.js';
import { searchFriendByID } from '../fetchers/request.js';
import { addMessageToChatBoxList } from '../utils/chatProcessor.js';

let turnOffNotification = false;

window.processingNotification = async function (notification) {
    // Xử lí theo loại notification
    const { typeNotification, srcID, text, timeSend } = notification;  // text chứa id document
    console.log("Notification type:", typeNotification);
    console.log("Notification srcID:", srcID);
    console.log("Notification text:", text);
    console.log("Notification timeSend:", timeSend);

    if (turnOffNotification === false) {
        playNotificationSound();  // Phát âm thanh thông báo
    }

    if (typeNotification === "message") {
        // Theo srcID để tìm ra người gửi lấy thông tin
        const msg = await getSingleMessage(srcID, text);  // text chứa id document

        // Đưa tin nhắn vào chat cho 2 trường hợp
        if (msg.senderId === window.lastClickedUser) {
            // 1. Nếu chat là chat đang mở
            addMessageToChatBoxServer(msg);  // Thêm tin nhắn vào chat box
        } else {
            // 2. Nếu chat không phải là chat đang mở
            addMessageToChatBoxList(msg);  // Thêm tin nhắn vào chat box
        }

    } else if (typeNotification === "friend-request"
            || typeNotification === "friend-accept") {
        // Lấy các thông tin và đưa lên thông báo
        await searchFriendByID(srcID).then((friend) => {
            const displayName = friend.displayName; // Tên bạn bè
            const email = friend.email; // Email bạn bè
            const avatarUrl = friend.avatar; // URL ảnh đại diện bạn bè
            const status = friend.status; // Trạng thái bạn bè
            addFriendRequestToList(displayName, email, avatarUrl, status);  // Thêm thông báo vào danh sách thông báo

        });
    } else if (typeNotification === "update-avatar") {
        // Lấy avatar mới từ srcID
        const { uid, avatar } = await searchFriendByID(srcID);

        // Cập nhật lại avatar của srcID
        // Tìm kiếm srcID
        // thay src = avatarUrl
    } else if (typeNotification === "display-name-update") {
        // Lấy tên mới từ srcID
        const { uid, displayName } = await searchFriendByID(srcID);

        // Cập nhật lại tên của srcID
        // Tìm kiếm srcID
        // thay src = displayName

    }  else if (typeNotification === "other") {
        // Xử lý thông báo khác: cập nhật avatars, tên hiển thị, hoặc thông báo hệ thống
        const text = notification.text; // Lấy thông báo từ text
        const timeSend = notification.timeSend; // Lấy thời gian gửi thông báo từ timeSend
        addNotificationToList(text, timeSend);  // Thêm thông báo vào danh sách thông báo

    } else {
        console.warn("Loại thông báo không xác định:", typeNotification);
    }
}

// Thêm 1 thông báo vào danh sách thông báo, chỉ áp dụng cho thông báo dạng text
function addNotificationToList(text, timeSend) {
    // Thông báo phải có id để xóa

    updateUnreadCount();
}

// Xóa 1 thông báo khỏi danh sách thông báo
function removeNotificationFromList(notificationId) {

}

function addFriendRequestToList(displayName, email, avatarUrl, status) {
    // Thêm thông báo kết bạn vào danh sách thông báo
    // đưa lênh thanh thông báo với dạng tựa hệt như thanh tìm kiếm
    // Lưu lại các thông tin trên vì sẽ ko load lại

    updateUnreadCount();
}

// Thay đổi số lượng thông báo chưa đọc (dấu chấm đỏ trên biểu tượng thông báo)
function updateUnreadCount(type) {
    // type = 'more' thì tăng lên 1
    // type = 'less' thì giảm đi 1
}

function playNotificationSound(src = 'level-up-191997.mp3') {
    const audio = new Audio(src);
    audio.play().catch((error) => {
        console.warn('không thể phát âm thanh:', error);
    });
}

function turnOnOrOffNotification() {
    // Nếu đang tắt thì bật
    if (turnOffNotification === true) {
        turnOffNotification = false;
    } else {
        turnOffNotification = true;
    }
}

export {
    addNotificationToList,
    removeNotificationFromList,
    addFriendRequestToList,
    turnOnOrOffNotification,
}