import { getFriendStatus, getUserInfo } from '../fetchers/request.js';
import { fetchMessages, startChatSession, updateTimestampMessage } from '../fetchers/chatFetcher.js';
import { addMessageToChatBoxServer } from '../chat/renderMessage.js';
import { addBoxChatToList, transmitMessageContainer, updateSeenMessageStyle, updateOnlineStatus } from "../chat/chatProcessor.js";
import { convertToDate, formatRelativeTimeOnline, isOnline } from "../utils/renderData.js";
import { addToListBoxNoNotice } from "../user/notificationProcessor.js";

window.loadPage = async function (){
    // Tạo trang
    const data = await getUserInfo();

    /* {
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

    const userAvatar = document.getElementById('mainAccountAvatar');
    userAvatar.src = data.avatar;

    const friendList = data.friendList; // danh sách bạn bè

    // lưu trữ ID bạn bè với thời gian gửi tin nhắn
    friendList.forEach(friend => {
        const friendID = friend.uid;
        window.listChatBoxID[friendID] = convertToDate(friend.lastMessage.timeSend);
    });

    // sắp xếp friendList theo thời gian gửi tin nhắn giảm dần (mới nhất trước)
    friendList.sort((a, b) => {
        const timeA = convertToDate(a.lastMessage.timeSend).getTime();
        const timeB = convertToDate(b.lastMessage.timeSend).getTime();
        return timeB - timeA; // nếu muốn tăng dần thì đổi thành timeA - timeB
    });

    for (const friend of friendList) {
        addBoxChatToList(friend);
    }
}

window.loadChat = async function () {
    const { chatID } = await startChatSession(window.lastClickedUser);
    sessionStorage.setItem('chatID', chatID);

    const chatData = await fetchMessages();
    const container = document.getElementById("messageContainer");

    fixMessageContainer(window.lastClickedUser);

    container.innerHTML = "";
    chatData.forEach(msg => {
        addMessageToChatBoxServer(msg);
    });

    updateSeenMessage(chatID);  // cập nhật trạng thái đã đọc

    container.style.scrollBehavior = 'auto';
    container.scrollTop = container.scrollHeight;
}

window.loadChatInfo = async function() {
    // Find the chat box for this user
    const chatID = window.lastClickedUser;
    const box = document.getElementById(chatID);
    if (!box) return;

    document.querySelector('.chats-info-header-avatar-container').classList.remove('chats-info-header-avatar-container-is-online');

    // Get user information from the box
    const name = box.querySelector('.chats-list-user-name').textContent;
    const avatar = box.querySelector('.chats-list-user-avatar').src;
    const stringTimeOnline = box.querySelector('.chats-list-user-content').dataset.date;
    const timeOnline = new Date(stringTimeOnline);

    document.querySelector('.chats-info-header-avatar').src = avatar;
    document.querySelector('.chats-info-header-name').textContent = name;
    document.querySelector('.chats-info-header-name-state').textContent = formatRelativeTimeOnline(timeOnline);
    if (isOnline(timeOnline)) {
        document.querySelector('.chats-info-header-avatar-container').classList.add('chats-info-header-avatar-container-is-online');
    }

}

window.updateLastOnlineListFriend = async function () {
    const lastOnlineList = await getFriendStatus(); // <uid, lastonline>

    for (const friendID of lastOnlineList) {
        const lastOnline = lastOnlineList[friendID]; // <uid, lastonline>

        // process
    }
}

