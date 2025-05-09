const { getAvatar, searchUser } = require("../services/utilityServices.cjs");
const { deleteNotificationSpecific } = require("../services/notificationServices.cjs");
const { getWebsitePreview } = require("../services/utilityServices.cjs");
const logger = require("../config/logger.cjs");

// Tìm kiếm bạn bè
async function searchFriend(req, res) {
    const { uid, emailFriend } = req.body;

    try {
        const user = await searchUser(uid, emailFriend);
        if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại!' });
        res.status(200).json(user);

    } catch (error) {
        logger.error(`Lỗi khi tìm kiếm bạn bè: ${error.message}`);
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

// Lấy ảnh đại diện
async function getAvatarUser(req, res) {
    const { friendID } = req.body;
    try {
        const user = await getAvatar(friendID);
        if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại!' });
        res.status(200).json(user);

    } catch (error) {
        logger.error(`Lỗi khi lấy ảnh đại diện: ${error.message}`);
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

// Xóa thông báo cụ thể (không phải là tin nhắn)
async function deleteNotification(req, res) {
    const { notification } = req.body;
    try {
        await deleteNotificationSpecific(notification);
        res.status(200).json({ message: 'Xóa thông báo thành công!' });

    } catch (error) {
        logger.error(`Lỗi khi xóa thông báo: ${error.message}`);
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

// Lấy thông tin website
async function getWebsiteInfo(req, res) {
    const { url } = req.body;
    try {
        const websiteInfo = await getWebsitePreview(url);
        if (!websiteInfo) return res.status(404).json({ message: 'Không tìm thấy thông tin website!' });
        res.status(200).json(websiteInfo);

    } catch (error) {
        logger.error(`Lỗi khi lấy thông tin website: ${error.message}`);
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

module.exports = {
    searchFriend,
    getAvatarUser,
    deleteNotification,
    getWebsiteInfo,
}