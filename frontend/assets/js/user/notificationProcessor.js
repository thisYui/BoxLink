import { addMessageToChatBoxServer } from '../chat/renderMessage.js';
import { getSingleMessage } from '../fetchers/chatFetcher.js';
import { searchFriendByID } from '../fetchers/request.js';
import { fixMessageToChatBoxList } from '../chat/chatProcessor.js';
import { moveChatIDToFirstInListBox, updateSeenMessageIcon } from '../chat/chatProcessor.js';
import { convertToDate, formatRelativeTimeSend } from '../utils/renderData.js';
import { socket } from '../config/socketClient.js';

let turnOffNotification = false;
let listBoxNoNotice = [];  // Danh sách các hộp chat không có thông báo

window.processingNotification = async function (notification) {
    // Xử lí theo loại notification
    const { typeNotification, srcID, text, timestamp, isRead } = notification;  // text chứa id document

    socket.emit("cleanNotifications");  // Xóa các thông báo đã đọc

    if (checkElementExistsByID(srcID)) {
        return;
    }

    // Dạng thông báo không âm thanh
    if (typeNotification === 'seen-message') {
        updateSeenMessageIcon(text, true);  // text chứa id của cuộc trò chuyện
        return;
    }

    if (turnOffNotification === false && !isRead) {
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

            const timeSend = convertToDate(timestamp);

            // timeSend có kieru date
            if (typeNotification === "friend-request") {
                addFriendRequestToList(srcID, displayName, email, avatarUrl, timeSend);  // Thêm thông báo vào danh sách thông báo
            } else {
                addFriendAcceptToList(srcID, displayName, email, avatarUrl, timeSend);  // Thêm thông báo vào danh sách thông báo
            }
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
        addTextNotificationToList(text);  // Thêm thông báo vào danh sách thông báo

    } else {
        console.warn("Loại thông báo không xác định:", typeNotification);
    }
}

function checkElementExistsByID(id) {
    const notificationList = document.querySelector('.notification-list');
    const notificationItem = notificationList.querySelector(`[id="${id}"]`);
    return notificationItem !== null;  // Trả về true nếu phần tử tồn tại, ngược lại false
}

// Thêm 1 thông báo vào danh sách thông báo, chỉ áp dụng cho thông báo dạng text
function addTextNotificationToList(text) {
    const notificationList = document.querySelector('.notification-list');
    const item = document.createElement('div');
    item.className = 'notification-item';
    item.id = 'text';  // ID cho thông báo dạng text

    const box = document.createElement('div');
    box.className = 'notification-box';

    const p = document.createElement('p');
    p.classList.add("notification-text");
    p.textContent = text;

    box.appendChild(p);
    item.appendChild(box);
    notificationList.appendChild(item);

    plusNotificationCount();
}

function addFriendRequestToList(friendID, displayName, email, avatarUrl, timeSend) {
    const notificationList = document.querySelector('.notification-list');
    const item = document.createElement('div');
    item.className = 'notification-item';
    item.id = friendID;

    const box = document.createElement('div');
    box.className = 'notification-box';

    addInformationFriend(box, friendID, displayName, email, avatarUrl, timeSend);  // Thêm thông tin bạn bè vào box

    const divAction = document.createElement('div');
    divAction.className = 'notification-actions';
    const acceptButton = document.createElement('button');
    acceptButton.className = 'btn-accept';
    acceptButton.textContent = t('notification.accept');

    // Button cho chấp nhận
    acceptButton.onclick = async () => {
        sessionStorage.setItem("searchUID", friendID);  // Lưu ID bạn bè vào sessionStorage
        await window.acceptFriend();
        const text = t('notification.accepted-request', { name: displayName });
        fixContentAfterClickActionFriend(box, divAction, text);  // Cập nhật nội dung sau khi chấp nhận
        subtractNotificationCount();  // Giảm số lượng thông báo
    }

    const declineButton = document.createElement('button');
    declineButton.className = 'btn-decline';
    declineButton.textContent = t('notification.decline');

    // Button cho từ chối
    declineButton.onclick = async () => {
        sessionStorage.setItem("searchUID", friendID);  // Lưu ID bạn bè vào sessionStorage
        await window.declineFriend();
        const text = t('notification.declined-request', { name: displayName });
        fixContentAfterClickActionFriend(box, divAction, text);  // Cập nhật nội dung sau khi từ chối
        subtractNotificationCount();  // Giảm số lượng thông báo
    }
    divAction.appendChild(acceptButton);
    divAction.appendChild(declineButton);

    box.appendChild(divAction);

    item.appendChild(box);
    notificationList.appendChild(item);

    plusNotificationCount();
}

function addFriendAcceptToList(friendID, displayName, email, avatarUrl, timeSend) {
    const notificationList = document.querySelector('.notification-list');
    const item = document.createElement('div');
    item.className = 'notification-item';
    item.id = friendID;

    const box = document.createElement('div');
    box.className = 'notification-box';

    addInformationFriend(box, friendID, displayName, email, avatarUrl, timeSend);  // Thêm thông tin bạn bè vào box

    const p = document.createElement('p');
    p.classList.add("notification-text");
    p.textContent = t('notification.friend-accepted', { name: displayName });

    box.appendChild(p);
    item.appendChild(box);
    notificationList.appendChild(item);

    plusNotificationCount();
}

function fixContentAfterClickActionFriend(box, divAction, text) {
    box.removeChild(divAction);  // Xóa các nút hành động

    const p = document.createElement('p');
    p.classList.add("notification-text");
    p.textContent = text;  // Thay thế bằng thông báo đã chấp nhận hoặc từ chối

    box.appendChild(p);  // Thêm thông báo vào item
}

function addInformationFriend(box, friendID, displayName, email, avatarUrl, timeSend) {
    const friendRequest = document.createElement('div');
    friendRequest.className = 'notification-box-friend-request';

    const img = document.createElement('img');
    img.classList.add("notification-avatar");
    img.src = avatarUrl;

    img.addEventListener('click', async () => {
        await chooseUserItem(friendID);
    })

    const div = document.createElement('div');
    div.className = 'notification-friend-info';
    const name = document.createElement('p');
    name.className = 'notification-friend-name';
    name.textContent = displayName;
    const emailElement = document.createElement('p');
    emailElement.textContent = email;
    div.appendChild(name);
    div.appendChild(emailElement);

    const time = document.createElement('span');
    time.className = 'notification-time';
    time.textContent = formatRelativeTimeSend(timeSend);  // Giả sử timeSend là chuỗi thời gian đã định dạng

    friendRequest.appendChild(img);
    friendRequest.appendChild(div);
    friendRequest.appendChild(time);
    box.appendChild(friendRequest);
}

window.resetNumberNotification = function() {
    const badge = document.querySelector('.notification-badge');
    if (!badge) return;

    // Ngoại trừi thông báo kết bạn tất cả được đánh dấu là đã đọc
    const notificationItems = document.querySelectorAll('.btn-accept');
    const numberNotification = notificationItems.length;

    badge.textContent = numberNotification.toString();
    badge.style.display = 'inline-block';
}

function plusNotificationCount() {
    const badge = document.querySelector('.notification-badge');
    if (!badge) return;

    if (badge.textContent === '99+') {
        return;
    }

    if (badge.textContent === '') {
        badge.textContent = '0';  // Khởi tạo nếu chưa có thông báo nào
    }

    badge.textContent = (1 + parseInt(badge.textContent)).toString();
    badge.style.display = 'inline-block';
}

function subtractNotificationCount() {
    const badge = document.querySelector('.notification-badge');
    if (!badge) return;

    if (badge.textContent === '0') {
        badge.style.display = 'none';
        return;
    }

    badge.textContent = (parseInt(badge.textContent) - 1).toString();
    if (badge.textContent <= 0) {
        badge.textContent = '0';
        badge.style.display = 'none';
    }
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
    turnOnOrOffNotification,
    addToListBoxNoNotice,
    removeFromListBoxNoNotice,
    isOnNotification,
}