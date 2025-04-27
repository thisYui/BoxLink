import { startChatSession, fetchMessages, sendMessages } from "./communicate/chat";

// Gọi hàm startChatSession khi người dùng nhấn vào 1 hộp chat
window.startChat = async function () {
    const friendID = document.getElementById("uid").textContent;
    const result = await startChatSession(friendID);

    if (!result) {
        console.error("Failed to start chat session");
        return false;
    }

    // Nếu thành công thì chuyển đến trang chat
    const chatData = await fetchMessages();

    // Mặt định lần trả về đầu tiên tối đa 100 tin nhắn
    // JSON {
    //    senderId: String
    //    type: String
    //    content: {},
    //    timestamp: timestamp,
    //    replyTo: String
    // }
    // chatData là 1 list có 100 phần tử
}

window.sendMessage = async function () {
}