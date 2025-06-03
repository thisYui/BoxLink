import { addMessageToChatBoxServer } from '../chat/renderMessage.js';
import { getSingleMessage } from '../fetchers/chatFetcher.js';
import { searchFriendByID } from '../fetchers/request.js';
import { fixMessageToChatBoxList } from '../chat/chatProcessor.js';
import { moveChatIDToFirstInListBox, updateSeenMessageIcon } from '../chat/chatProcessor.js';
import { convertToDate } from '../utils/renderData.js';

let turnOffNotification = false;
let listBoxNoNotice = [];  // Danh sách các hộp chat không có thông báo

window.processingNotification = async function (notification) {
    // Xử lí theo loại notification
    const { typeNotification, srcID, text, timeSend } = notification;  // text chứa id document

    // Dạng thông báo không âm thanh
    if (typeNotification === 'seen-message') {
        updateSeenMessageIcon(text, true);  // text chứa id của cuộc trò chuyện
        return;
    }

    if (turnOffNotification === false) {
        if (!listBoxNoNotice.includes(srcID)) {  // srcID là ID của người gửi thông báo
            playNotificationSound();  // Phát âm thanh thông báo
        }
    }

    if (typeNotification === "message") {
        // Theo srcID để tìm ra người gửi lấy thông tin
        const msg = await getSingleMessage(srcID, text);  // text chứa id document
        msg.timestamp = convertToDate(msg.timestamp);  // Chuyển đổi thời gian gửi tin nhắn
        moveChatIDToFirstInListBox(msg.senderID);

        // Đưa tin nhắn vào chat cho 2 trường hợp
        if (msg.senderID === window.lastClickedUser) {
            // 1. Nếu chat là chat đang mở
            fixMessageToChatBoxList(msg.senderID, msg, true);
            addMessageToChatBoxServer(msg);  // Thêm tin nhắn vào chat box

            const container = document.getElementById("messageContainer");
            container.style.scrollBehavior = 'auto';
            container.scrollTop = container.scrollHeight;  // Cuộn xuống cuối chat box

        } else {
            // 2. Nếu chat không phải là chat đang mở
            fixMessageToChatBoxList(msg.senderID, msg, false);  // Thêm tin nhắn vào chat box
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

    } else if (typeNotification === "other") {
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

function playNotificationSound(src = 'assets/sound/level-up-191997.mp3') {
    const audio = new Audio(src);
    audio.play().catch((error) => {
        console.warn('không thể phát âm thanh:', error);
    });
}

function turnOnOrOffNotification() {
    turnOffNotification = turnOffNotification !== true;
}

function addToListBoxNoNotice(chatID) {
    if (!listBoxNoNotice.includes(chatID)) {
        listBoxNoNotice.push(chatID);
    }
}

function removeFromListBoxNoNotice(chatID) {
    const index = listBoxNoNotice.indexOf(chatID);
    if (index !== -1) {
        listBoxNoNotice.splice(index, 1);
    }
}

function isOnNotification(uid) {
    return listBoxNoNotice.includes(uid) === false;
}

export {
    addNotificationToList,
    removeNotificationFromList,
    addFriendRequestToList,
    turnOnOrOffNotification,
    addToListBoxNoNotice,
    removeFromListBoxNoNotice,
    isOnNotification,
}