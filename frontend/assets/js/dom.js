import { searchFriend, getUserInfo } from './communicate/request.js';
import {startChatSession, sendMessages, fetchMessages} from "./communicate/chat.js";
window.reload = async function (api){
    /** API
     * reload-avatar: được gọi đến khi người dùng cập nhật ảnh đại diện
     * reload-chat: khi hai bên có bất kỳ tương tác nào đó reload lại khung chat
     * reload-notifications: khi có bất kì thông báo nào đó như
        lời mời kết bạn
        lời mời kết bạn đã được chấp nhận
        thao tác từ chối lời mời kết bạn
        thông báo tin nhắn không nằm trong khung chat (reload in đậm)
     * reload-search: khi người dùng tìm kiếm bạn bè
     * reload-taskbar: khi người dùng có bất kì tương tác nào đó với taskbar

    */

}

window.searchBar = async function (){
    const email = document.getElementById("search-input").value;
    const user = await searchFriend(email);
    // displayName: displayName,
    // email: email,
    // avatar: url
    // status: friend / sender-request / none

    if (user.email === 'no-email') {

    }
}


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
        },
        {}, {}, ...
      ]
    } */

    const avatar = data.avatar; // URL của ảnh đại diện
    const name = data.displayName; // Tên người dùng
    const email = data.email; // Email người dùng
    // Processing
    const userAvatar = document.getElementById('mainAccountAvatar');
    userAvatar.src = avatar;


    const friendList = data.friendList; // Danh sách bạn bè
    for (const friend of friendList) {
        const friendName = friend.displayName; // Tên bạn bè
        const friendID = friend.uid; // ID bạn bè
        const friendAvatar = friend.avatar; // URL ảnh đại diện bạn bè
        const text = friend.lastMessage.text; // Tin nhắn cuối cùng
        const timeSend = friend.lastMessage.timeSend; // Thời gian gửi tin nhắn
        const timeSeen = friend.lastMessage.timeSeen; // Thời gian đã đọc tin nhắn
        const lastOnline = friend.lastOnline; // Thời gian cuối cùng online
        
        console.log("friend's ID: ", friend.uid);
        // Processing
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
        console.log(name.textContent);
        const lastestMessage = document.createElement('p');
        lastestMessage.classList.add('lastest-chat');
        lastestMessage.textContent = text;

        containBox.appendChild(name);
        containBox.appendChild(lastestMessage);
        div.appendChild(img);
        div.appendChild(containBox);
        chatsContainer.appendChild(div);
    }


}

window.test = async function () {
try {
  const data = await searchFriend('test2@gmail.com');
  document.getElementById("image").src = data.avatar || '';
  document.getElementById("name").textContent = data.displayName || 'Không có tên';
  document.getElementById("email").textContent = data.email || 'Chưa có thông tin';
  document.getElementById("status").textContent = data.status || 'Chưa có mô tả';
  document.getElementById("result").style.display = 'block';
} catch (err) {
  console.error('Lỗi khi tìm kiếm:', err);
}
}

window.testSend = async function () {
  const data = document.getElementById("inputField").value;

  await startChatSession('8JInD1tarOTVYBVWeBl1Pb6lQSH2');

  await sendMessages("8JInD1tarOTVYBVWeBl1Pb6lQSH2", 'text', data, 0)

  document.getElementById("inputField").value = '';
}

window.loadChat = async function () {
  //const friendID = // document.getElementById("friendID").value;
    
  await startChatSession(window.lastClickedUser);
  const chatData = await fetchMessages();

  const currentUserId = localStorage.getItem("uid"); // Lấy email từ localStorage

  const container = document.getElementById("messageContainer");
  container.innerHTML = "";
  chatData.forEach(msg => {
    const div = document.createElement("div");
    const p = document.createElement("p");
    const isCurrentUser = msg.senderId === currentUserId;
    div.classList.add("message-content", "messageText");
    if (isCurrentUser) {
      div.classList.add("sender");
    }
    p.textContent = msg.content.text;
    div.appendChild(p);
    container.appendChild(div);
    if (msg.type === "system") {
      div.classList.add("systemMessage");
    }
  });
  container.scrollTop = container.scrollHeight;
}


window.send = async function () {
    const textMessage = document.getElementById("message-input").value.trim();
    if (textMessage.length > 0) {
      await sendMessages("R340SWcxQFQS4HVbe2bXDezIHOF2", 'text', textMessage, "")
  
      const container = document.getElementById("messageContainer");
      const div = document.createElement("div");
      const p = document.createElement("p");
      div.classList.add("message-content", "sender", "messageText");
      p.textContent = textMessage;
      div.appendChild(p);
      container.appendChild(div);
      document.getElementById("message-input").value = '';
    }


}

document.getElementById("send-button").addEventListener("click", () => {
    send().then()
});