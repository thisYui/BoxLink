const {
    getAvatar,
    searchUser,
} = require("../services/utilityServices.cjs");
const { deleteNotificationSpecific } = require("../services/notificationServices.cjs");

// Tìm kiếm bạn bè
async function searchFriend(req, res) {
    const { uid, emailFriend } = req.body;
    console.log(uid, emailFriend);
    try {
        const user = await searchUser(uid, emailFriend);
        console.log(user);
        if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại!' });
        res.status(200).json(user);
    } catch (error) {
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
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

module.exports = {
    searchFriend,
    getAvatarUser,
    deleteNotification,
}