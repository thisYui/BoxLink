import { sendMessages } from '../fetchers/chatFetcher.js';
import { addMessageToChatBoxClient } from '../chat/renderMessage.js';
import { getDataFromDocument, isValidMessage } from '../utils/renderData.js';

window.sendMessage = async function (typeInput) {
    // Xử lí dữ liệu trước khi gửi
    const { type, content, replyTo } = await getDataFromDocument(typeInput);

    if (isValidMessage(content)) {
        const messageID = await sendMessages(sessionStorage.getItem("lastClickedUser"), type, content, replyTo); // Gửi tin nhắn đến destination
        addMessageToChatBoxClient(messageID, type, content, replyTo); // Thêm tin nhắn vào chat box
    }

    if (replyTo) {
        document.getElementById('closeReplyTo').click();
    }
}
