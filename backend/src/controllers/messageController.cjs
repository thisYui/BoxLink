const { createChat, deleteChat } = require('../services/firebaseServices.cjs');
const logger = require('../config/logger.cjs');

// Tạo cuộc trò chuyện
async function createNewChat(req, res) {
    const { friendId } = req.body;
    try {
        const chat = await createChat(friendId);
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


// Gửi tin nhắn
async function sendMessage(req, res) {

}

module.exports = {
    createNewChat,
    removeChat,
}