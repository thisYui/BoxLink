import { sendMessages } from '../fetchers/chatFetcher.js';
import { searchFriendByEmail, deleteNotification  } from '../fetchers/request.js';
import { addMessageToChatBoxClient } from '../utils/renderMessage.js';
import { getDataFromDocument } from '../utils/renderData.js';
import { removeNotificationFromList } from '../user/notificationProcessor.js';
import { getMyProfile, setAvatar, setDisplayName, } from '../user/personalProfile.js';

window.sendMessage = async function (typeInput) {
    // Xử lí dữ liệu trước khi gửi
    const { type, content, replyTo } = await getDataFromDocument(typeInput);

    if (content.length > 0) {
        const messageID = await sendMessages(window.lastClickedUser, type, content, replyTo); // Gửi tin nhắn đến destination
        addMessageToChatBoxClient(messageID, type, content, replyTo); // Thêm tin nhắn vào chat box
    }
}

window.clickRequestFriend = async function (friendID) {
    // khi tìm kếm bạn bè sẽ có các lựa chọn accept / refXuse / send / none
    // nếu đang send-request ấn vào sẽ là cancel về none
    // tương tự với mấy cái khác
}


window.searchBar = async function (){
    const email = document.getElementById("search-input").value;
    const user = await searchFriendByEmail(email);
    // displayName: displayName,
    // email: email,
    // avatar: url
    // status: friend / sender-request / receiver-request / none

    if (user.email === 'no-email') {
        // Không tìm thấy người dùng
        // muốn hiện sao cũng đc
    } else {
        if (user.status === 'friend') {
            // icon bạn bè
        } else if (user.status === 'sender-request') {
            // icon đã gửi lời mời
        } else if (user.status === 'receiver-request') {
            // icon đã nhận lời mời
        } else {
            // icon mũi tên ấn vào thì gửi lời mời
        }
    }
}

// Đánh dấu 1 thông báo là đã đọc
window.readNotification = async function (event) {
    // removeNotificationFromList(notificationID); // Xóa thông báo khỏi danh sách
    // deleteNotification(notificationID); // Xóa thông báo khỏi database
}

// Thay đổi ảnh đại diện
window.updateAvatar = async function (event) {

}

// Thay đổi tên hiển thị
window.updateDisplayName = async function (event) {

}

// Hiển thị profile cá nhân
window.showProfile = async function () {
    const profile = await getMyProfile();
    loadProfile(profile);
}