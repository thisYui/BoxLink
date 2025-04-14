const { createChat, deleteChat } = require('../services/firebaseServices.cjs');
const { startChat, sendMessage, getMessages, loadMore } = require('../services/messageServices.cjs');
const logger = require('../config/logger.cjs');

// Tạo cuộc trò chuyện
async function createNewChat(req, res) {
    const { uid, emailFriend } = req.body;
    try {
        const chat = await createChat(uid, emailFriend);
        res.status(200).json(chat);
    } catch (error) {
        logger.error('Lỗi khi tạo cuộc trò chuyện:', error);
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

// Xóa cuộc trò chuyện
async function removeChat(req, res) {
    const { chatId } = req.body;
    try {
        await deleteChat(chatId);
        res.status(200).json({ message: 'Cuộc trò chuyện đã được xóa thành công!' });
    } catch (error) {
        logger.error('Lỗi khi xóa cuộc trò chuyện:', error);
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

// Tạo phiên
async function startChatSession(req, res) {
    const { userId, emailFriend } = req.body;
    try {
        // Tạo phiên chat
        await startChat(userId, emailFriend);
        res.status(200).json({ message: `Phiên chat được mở với ${emailFriend}` });
    } catch (error) {
        logger.error('Lỗi khi tạo phiên chat:', error);
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

// Lấy tin nhắn và gửi đến firebase
async function sendMessages(req, res) {
    const { emailFriend, type, content, replyTo} = req.params;
    try {
        await sendMessage(emailFriend, type, content, replyTo);
        res.status(200).json({ message: 'Tin nhắn đã được gửi thành công!' });
    } catch (error) {
        logger.error('Lỗi khi lấy tin nhắn:', error);
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

// Lấy tin nhắn
async function fetchMessages(req, res) {
    try {
        const messages = await getMessages();
        res.status(200).json(messages);
    } catch (error) {
        logger.error('Lỗi khi lấy tin nhắn:', error);
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

// Tải thêm tin nhắn
async function loadMoreMessages(req, res) {
    try {
        const messages = await loadMore();
        res.status(200).json(messages);
    } catch (error) {
        logger.error('Lỗi khi tải thêm tin nhắn:', error);
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

module.exports = {
    createNewChat,
    removeChat,
    startChatSession,
    sendMessages,
    fetchMessages,
    loadMoreMessages
}