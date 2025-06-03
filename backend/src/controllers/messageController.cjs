const { createChat, deleteChat } = require('../services/firebaseServices.cjs');
const { downloadFile } = require('../services/fileServices.cjs');
const { findChat, startChat, sendMessage, getMessages,
    getSingle, loadMore, updateSeen, turnNotification
} = require('../services/messageServices.cjs');
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
    const { uid, friendID } = req.body;
    try {
        const chatID = await findChat(uid, friendID);
        await deleteChat(chatID);
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
        const chatID = await startChat(uid, friendID);
        res.status(200).json({ chatID });

    } catch (error) {
        logger.error('Lỗi khi tạo phiên chat:', error);
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

// Lấy tin nhắn và gửi đến firebase
async function sendMessages(req, res) {
    const { chatID, uid,  friendID, type, content, replyTo } = req.body;

    try {
        const messID = await sendMessage(chatID, uid, friendID, type, content, replyTo);
        res.status(200).json({ messID });

    } catch (error) {
        logger.error('Lỗi khi lấy tin nhắn:', error);
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

// Lấy tin nhắn
async function fetchMessages(req, res) {
    const { chatID } = req.body;

    try {
        const messages = await getMessages(chatID);
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

// Cập nhật trạng thái đã đọc tin nhắn
async function updateSeenMessage(req, res) {
    const { friendID, uid } = req.body;

    try {
        // Cập nhật trạng thái đã đọc
        await updateSeen(uid, friendID);
        res.status(200).json({ message: 'Trạng thái đã được cập nhật!' });

    } catch (error) {
        logger.error('Lỗi khi cập nhật trạng thái đã đọc:', error);
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

// Tải thêm tin nhắn
async function loadMoreMessages(req, res) {
    const { chatID } = req.body;

    try {
        const messages = await loadMore(chatID);
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

// Bật tắt thông báo
async function toggleNotification(req, res) {
    const { uid, friendID } = req.body;

    try {
        // Thay đổi trạng thái thông báo
        await turnNotification(uid, friendID);
        res.status(200).json({ message: 'Trạng thái thông báo đã được cập nhật!' });

    } catch (error) {
        logger.error('Lỗi khi cập nhật trạng thái thông báo:', error);
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

module.exports = {
    createNewChat, removeChat, startChatSession,
    sendMessages, getSingleMessage, updateSeenMessage,
    fetchMessages,loadMoreMessages, clickDownload,
    toggleNotification
}