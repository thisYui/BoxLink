const { getInfo,
    setPassword,
    setAvatar,
    setDisplayName,
    removeFriend,
    acceptFriend,
    friendRequest,
    updateLastOnline,
} = require("../services/userServices.cjs");
const { deleteAuth } = require("../services/firebaseServices.cjs");
const logger = require("../config/logger.cjs");

// Lấy thông tin người dùng từ email
async function getUserInfo(req, res) {
    const { uid } = req.body;
    try {
        const user = await getInfo(uid);
        if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại!' });
        res.status(200).json(user);

    } catch (error) {
        logger.error('Lỗi khi lấy thông tin người dùng!', { uid });
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

// Thay đổi ảnh đại diện
async function changeAvatar(req, res) {
    const { uid,  avatar } = req.body;
    try {
        const user = await setAvatar(uid, avatar);
        if (!user) return res.status(404).json({ message: 'Cập nhật ảnh đại diện thất bại!' });
        res.status(200).json({ message: 'Cập nhật ảnh đại diện thành công!' });

    } catch (error) {
        logger.error('Lỗi khi cập nhật ảnh đại diện!', { uid });
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

// Thay đổi tên hiển thị
async function changeDisplayName(req, res) {
    const { uid, displayName } = req.body;
    try {
        const user = await setDisplayName(uid, displayName);
        if (!user) return res.status(404).json({ message: 'Cập nhật tên hiển thị thất bại!' });
        res.status(200).json({ message: 'Cập nhật tên hiển thị thành công!' });

    } catch (error) {
        logger.error('Lỗi khi cập nhật tên hiển thị!', { uid });
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

// Hủy kết bạn
async function unfriend(req, res) {
    const { uid, emailFriend } = req.body;
    try {
        const user = await removeFriend(uid, emailFriend);
        if (!user) return res.status(404).json({ message: 'Hủy kết bạn thất bại!' });
        res.status(200).json({ message: 'Đã hủy kết bạn!' });

    } catch (error) {
        logger.error('Lỗi khi hủy kết bạn!', { uid });
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

// Gửi lời mời kết bạn
async function sendFriendRequest(req, res) {
    const { uid, emailFriend} = req.body;
    try {
        const user = await friendRequest(uid, emailFriend);
        if (!user) return res.status(404).json({ message: 'Gửi lời mời thất bại!' });
        // Gửi lời mời kết bạn
        res.status(200).json({ message: 'Lời mời kết bạn đã được gửi!' });

    } catch (error) {
        logger.error('Lỗi khi gửi lời mời kết bạn!', { uid });
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

// Xác nhận lời mời kết bạn
async function acceptFriendRequest(req, res) {
    const { uid, emailFriend } = req.body;
    try {
        const user = await acceptFriend(uid, emailFriend);
        if (!user) return res.status(404).json({ message: 'Chấp nhận lời mời thất bại!' });
        res.status(200).json({ message: 'Đã chấp nhận lời mời kết bạn!' });

    } catch (error) {
        logger.error('Lỗi khi chấp nhận lời mời kết bạn!', { uid });
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

// Xóa lời mời kết bạn
async function cancelFriendRequest(req, res) {
    const { uid, emailFriend } = req.body;
    try {
        const user = await unfriend(uid, emailFriend);
        if (!user) return res.status(404).json({ message: 'Hủy lời mời kết bạn thất bại!' });
        res.status(200).json({ message: 'Đã hủy lời mời kết bạn!' });

    } catch (error) {
        logger.error('Lỗi khi hủy lời mời kết bạn!', { uid });
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

// Thay đổi mật khẩu
async function resetPassword(req, res) {
    const { uid, password } = req.body;

    try {
        const user = await setPassword(uid, password);
        if (!user) return res.status(404).json({ message: 'Cập nhật mật khẩu thất bại!' });
        logger.info('Cập nhật mật khẩu thành công!', { uid });
        res.status(200).json({ message: 'Cập nhật mật khẩu thành công!' });

    } catch (error) {
        logger.error('Lỗi khi cập nhật mật khẩu!', { uid });
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

// Xóa tài khoản
async function deleteAccount(req, res) {
    const { uid } = req.body;
    try {
        const user = await deleteAuth(uid);
        if (!user) return res.status(404).json({ message: 'Xóa tài khoản thất bại!' });
        logger.info('Xóa tài khoản thành công!', { uid });
        res.status(200).json({ message: 'Tài khoản đã được xóa!' });

    } catch (error) {
        logger.error('Lỗi khi xóa tài khoản!', { uid });
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

// Cập nhật thời gian online
async function updateOnline(req, res) {
    const { uid } = req.body;
    try {
        await updateLastOnline(uid);
        res.status(200).json({ message: 'Cập nhật thời gian online thành công!' });

    } catch (error) {
        logger.error('Lỗi khi cập nhật thời gian online!', { uid });
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

module.exports = {
    getUserInfo,
    changeAvatar,
    resetPassword,
    changeDisplayName,
    unfriend,
    sendFriendRequest,
    acceptFriendRequest,
    cancelFriendRequest,
    deleteAccount,
    updateOnline,
};
