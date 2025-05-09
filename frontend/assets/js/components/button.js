import { sendMessages } from '../fetchers/chatFetcher.js';
import { searchFriend  } from '../fetchers/request.js';
import { addMessageToChatBoxClient } from '../utils/renderMessage.js';
import { getDataFromDocument } from '../utils/renderData.js';

window.sendMessage = async function (event, type) {
    // Xử lí dữ liệu trước khi gửi
    const { type, content, replyTo } = await getDataFromDocument(type);

    if (content.length > 0) {
        addMessageToChatBoxClient(type, content, replyTo); // Thêm tin nhắn vào chat box
        await sendMessages(window.lastClickedUser, type, content, replyTo); // Gửi tin nhắn đến destination
    }
}

window.clickRequestFriend = async function (friendID) {
    // khi tìm kếm bạn bè sẽ có các lựa chọn accept / refXuse / send / none
    // nếu đang send-request ấn vào sẽ là cancel về none
    // tương tự với mấy cái khác
}


window.searchBar = async function (){
    const email = document.getElementById("search-input").value;
    const user = await searchFriend(email);
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