import { friend } from "../fetchers/infoFetcher.js";
import { getBoxChatInfo } from "../fetchers/request.js";
import { addBoxChatToList, moveChatIDToFirstInListBox } from "../chat/chatProcessor.js"

window.toggleStatusFriend = async function(friendID, type) {
    if (type === 'send') {
        // Gửi lời mời kết bạn
        await friend(localStorage.getItem("uid"), friendID, "friend-request");

    } else if (type === 'accept') {
        // Đồng ý kết bạn
        const { chatID } = await friend(localStorage.getItem("uid"), friendID, "accept-friend");

        // Thêm friend vào danh sách chat
        const box = await getBoxChatInfo(chatID);
        addBoxChatToList(box);
        moveChatIDToFirstInListBox(chatID);

    } else if (type === 'remove') {
        // Xóa bạn bè
        await friend(localStorage.getItem("uid"), friendID, "unfriend");

        const chatList = document.querySelector(".chats-list");
        const chatUser = chatList.querySelector(`[id="${friendID}"]`);
        chatUser.remove();

    } else if (type === 'recall') {
        // Thu hồi lời mời kết bạn
        await friend(localStorage.getItem("uid"), friendID, "recall-friend");
    }
}

window.addFriend = async function() {
    // Gửi lời mời kết bạn
    await friend(localStorage.getItem("uid"), sessionStorage.getItem("searchUID"), "friend-request");

    // Đưa về friend-request
    fixStatusFriend('friend-request');
}

window.acceptFriend = async function() {
    // Đồng ý kết bạn
    const { chatID } = await friend(localStorage.getItem("uid"), sessionStorage.getItem("searchUID"), "accept-friend");

    // Đưa về bạn bè
    fixStatusFriend('friend');

    // Thêm friend vào danh sách chat
    const box = await getBoxChatInfo(chatID);

    addBoxChatToList(box);
    moveChatIDToFirstInListBox(chatID);
}

window.declineFriend = async function() {
    // Từ chối kết bạn
    await friend(localStorage.getItem("uid"), sessionStorage.getItem("searchUID"), "cancel-friend");

    // Đưa về none
    fixStatusFriend('none');
}

window.removeFriend = async function() {
    // Xóa bạn bè
    const friendID = sessionStorage.getItem("searchUID");
    await friend(localStorage.getItem("uid"), friendID, "unfriend");

    // Đưa về none
    fixStatusFriend('none');

    const chatList = document.querySelector(".chats-list");
    const chatUser = chatList.querySelector(`[id="${friendID}"]`);
    chatUser.remove();
}

window.recallFriend = async function() {
    // Thu hồi lời mời kết bạn
    await friend(localStorage.getItem("uid"), sessionStorage.getItem("searchUID"), "recall-friend");

    // Đưa về none
    fixStatusFriend('none');
}

window.openChat = async function() {
    const friendID = sessionStorage.getItem("searchUID");
    await changeTab("Home"); // Chuyển sang tab Home

    // Mở hộp chat
    const messageContainer = document.getElementById("chatContainer");
    const element = messageContainer.querySelector(`[id="${friendID}"]`);
    handleUserClick(element);  // Thao tác chọn người dùng

    // Xóa đi thông tin tìm kiếm
    document.getElementById('clearButton').click();
}

function fixStatusFriend(status) {
    // Ẩn toàn bộ
    const profileContainer = document.querySelector(".profile-friend-container");
    const friendActionButtons = profileContainer.querySelectorAll(".friend-action-button");
    friendActionButtons.forEach(button => {
        button.classList.add("hidden");
    });

    // Kiểm tra tình trạng kết bạn
    if (status === "friend-request") {
        // Đã gửi lời mời kết bạn
        const sendButton = profileContainer.querySelector(".request-sent");
        const recallButton = profileContainer.querySelector(".recall-request");
        sendButton.classList.remove("hidden");
        recallButton.classList.remove("hidden");

    } else if (status === "receiver-request") {
        // Đã nhận lời mời kết bạn
        const acceptButton = profileContainer.querySelector(".accept-request");
        const declineButton = profileContainer.querySelector(".decline-request");
        acceptButton.classList.remove("hidden");
        declineButton.classList.remove("hidden");

    } else if (status === "friend") {
        // Đã là bạn bè
        const friendButton = profileContainer.querySelector(".friend");
        const removeButton = profileContainer.querySelector(".remove-friend");
        const openChatButton = profileContainer.querySelector(".open-chat");
        friendButton.classList.remove("hidden");
        removeButton.classList.remove("hidden");
        openChatButton.classList.remove("hidden");

    } else {
        // Chưa kết bạn
        const addButton = profileContainer.querySelector(".add-friend");
        addButton.classList.remove("hidden");
    }
}

export {
    fixStatusFriend,
}
