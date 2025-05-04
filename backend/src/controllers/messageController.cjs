const { createChat, deleteChat } = require('../services/firebaseServices.cjs');
const { startChat, sendMessage, getMessages, getSingle, loadMore } = require('../services/messageServices.cjs');
const { downloadFile } = require('../services/fileServices.cjs');
const logger = require('../config/logger.cjs');

// Tạo cuộc trò chuyện
async function createNewChat(req, res) {
    const { uid, friendID } = req.body;
    try {
        const chat = await createChat(uid, friendID);
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
    const { uid, friendID } = req.body;
    try {
        // Tạo phiên chat
        await startChat(uid, friendID);
        res.status(200).json({ message: `Phiên chat được mở với ${friendID}` });
    } catch (error) {
        logger.error('Lỗi khi tạo phiên chat:', error);
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

// Lấy tin nhắn và gửi đến firebase
async function sendMessages(req, res) {
    const { uid,  friendID, type, content, replyTo } = req.body;
    console.log(req.body);
    try {
        await sendMessage(uid, friendID, type, content, replyTo);
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

// Lấy tin nhắn duy nhất
async function getSingleMessage(req, res) {
    const { uid, srcID, messageID } = req.body;
    try {
        const message = await getSingle(uid, srcID, messageID);
        res.status(200).json(message);
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

// Tải file từ firebase
async function clickDownload(req, res) {
    const { filePath } = req.body;
    try {
        const fileURL = await downloadFile(filePath);
        res.status(200).json({ message: 'File đã được tải lên thành công!', fileURL });
    } catch (error) {
        logger.error('Lỗi khi tải file:', error);
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

module.exports = {
    createNewChat,
    removeChat,
    startChatSession,
    sendMessages,
    getSingleMessage,
    fetchMessages,
    loadMoreMessages,
    clickDownload,
}