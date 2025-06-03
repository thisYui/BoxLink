const { searchUserByEmail, searchUserByID } = require("../services/utilityServices.cjs");
const { deleteNotificationSpecific } = require("../services/notificationServices.cjs");
const { getWebsitePreview, getLastOnlineObject } = require("../services/utilityServices.cjs");
const logger = require("../config/logger.cjs");

// Tìm kiếm bạn bè
async function searchFriend(req, res) {
    const { uid, emailFriend, friendID } = req.body;

    try {
        const user =  (emailFriend === "no-email") ? await searchUserByID(uid, friendID) : await searchUserByEmail(uid, emailFriend);
        if (!user)  return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
        res.status(200).json(user);

    } catch (error) {
        logger.error(`Lỗi khi tìm kiếm bạn bè: ${error.message}`);
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

// Lấy trạng thái online của bạn bè
async function getFriendStatus(req, res) {
    const { uid } = req.body;
    try {
        const friendStatus = await getLastOnlineObject(uid);
        if (!friendStatus) return res.status(404).json({ message: 'Không tìm thấy trạng thái bạn bè!' });
        res.status(200).json(friendStatus);

    } catch (error) {
        logger.error(`Lỗi khi lấy trạng thái bạn bè: ${error.message}`);
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

module.exports = {
    searchFriend, deleteNotification,
    getWebsiteInfo, getFriendStatus,
}