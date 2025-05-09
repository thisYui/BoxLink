import { getUserInfo } from '../fetchers/request.js';
import { startChatSession,  fetchMessages } from '../fetchers/chatFetcher.js';
import { addMessageToChatBoxServer } from '../utils/renderMessage.js';


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
    for (const friend of friendList) {
        const friendName = friend.displayName; // Tên bạn bè
        const friendID = friend.uid; // ID bạn bè
        const friendAvatar = friend.avatar; // URL ảnh đại diện bạn bè
        const text = friend.lastMessage.text; // Tin nhắn cuối cùng
        const timeSend = friend.lastMessage.timeSend; // Thời gian gửi tin nhắn
        const timeSeen = friend.lastMessage.timeSeen; // Thời gian đã đọc tin nhắn
        const lastOnline = friend.lastOnline; // Thời gian cuối cùng online

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
