import { getFriendStatus, getUserInfo } from '../fetchers/request.js';
import { fetchMessages, startChatSession } from '../fetchers/chatFetcher.js';
import { addMessageToChatBoxServer } from '../utils/renderMessage.js';
import { addBoxChatToList } from "../utils/chatProcessor.js";
import { convertToDate } from "../utils/renderData.js";

window.loadPage = async function (){
    // Tạo trang
    const data = await getUserInfo();

    /* {
    displayName:
    email:
    avatar:
    friendList: [
    {
        displayName:
        uid:
        avatar:
        lastMessage: {}
        lastOnline:
    },..]
    }*/

    const avatar = data.avatar; // URL của ảnh đại diện
    const name = data.displayName; // Tên người dùng
    const email = data.email; // Email người dùng

    const userAvatar = document.getElementById('mainAccountAvatar');
    userAvatar.src = avatar;
    // Hiện tên người dùng
    // Hiện email người dùng

    const friendList = data.friendList; // Danh sách bạn bè

    // Lưu trữ ID bạn bè với thời gian gửi tin nhắn
    friendList.forEach(friend => {
        const friendID = friend.uid; // ID bạn bè
        window.listChatBoxID[friendID] = convertToDate(friend.lastMessage.timeSend); // Lưu trữ theo ID bạn bè
    });

    for (const friend of friendList) {
        addBoxChatToList(friend);
    }
}

window.loadChat = async function () {
    await startChatSession(window.lastClickedUser);
    const chatData = await fetchMessages();
    const currentUserId = localStorage.getItem("uid"); // Lấy email từ localStorage
    const container = document.getElementById("messageContainer");

    container.innerHTML = "";
    chatData.forEach(msg => {
        addMessageToChatBoxServer(msg);
    });
    container.scrollTop = container.scrollHeight;
}

window.updateLastOnlineListFriend = async function () {
    const lastOnlineList = await getFriendStatus(); // <uid, lastonline>

    for (const friendID of lastOnlineList) {
        const lastOnline = lastOnlineList[friendID]; // <uid, lastonline>

        // process
    }
}

// Ẩn hoặc hiện danh sách chat
function hiddenChatList() {

}

// Đưa box chat được chọn lên đầu khi nhận tin nhắn
function moveBoxOnTopOfChatList(chatID) {

}

export {
    hiddenChatList,
    moveBoxOnTopOfChatList,
}
