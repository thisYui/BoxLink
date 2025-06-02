import { getFriendStatus, getUserInfo } from '../fetchers/request.js';
import { fetchMessages, startChatSession } from '../fetchers/chatFetcher.js';
import { addMessageToChatBoxServer } from '../utils/renderMessage.js';
import { addBoxChatToList, transmitMessageContainer, updateSeenMessageStyle, updateOnlineStatus } from "../utils/chatProcessor.js";
import { convertToDate } from "../utils/renderData.js";

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

    transmitMessageContainer(window.lastClickedUser);

    container.innerHTML = "";
    chatData.forEach(msg => {
        addMessageToChatBoxServer(msg);
    });

    updateSeenMessageStyle();  // cập nhật trạng thái đã đọc

    container.style.scrollBehavior = 'auto';
    container.scrollTop = container.scrollHeight;
}

window.updateLastOnlineListFriend = async function () {
    const lastOnlineList = await getFriendStatus(); // <uid, lastonline>

    for (const friendID in lastOnlineList) {
        const lastOnline = lastOnlineList[friendID]; // <uid, lastonline>
        const time = convertToDate(lastOnline);

        updateOnlineStatus(friendID, time);
    }
}

