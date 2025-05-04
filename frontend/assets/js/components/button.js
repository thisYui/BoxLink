import { sendMessages } from '../fetchers/chat.js';
import { addMessageToChatBox } from '../utils/process.js';

window.sendMessage = async function () {
    const textMessage = document.getElementById("message-input").value.trim();
    if (textMessage.length > 0) {
        await sendMessages(window.lastClickedUser, 'text', textMessage, ""); // Gửi tin nhắ
        addMessageToChatBox(textMessage); // Thêm tin nhắn vào chat box
    }
}

window.clickRequestFriend = async function (friendID) {
    // khi tìm kếm bạn bè sẽ có các lựa chọn accept / refuse / send / none
    // nếu đang send-request ấn vào sẽ là cancel về none
    // tương tự với mấy cái khác
}