const { getInfo, setPassword, setAvatar,
    setDisplayName, removeFriend, acceptFriend,
    friendRequest, cancelFriend, recall,
    updateLastOnline, getProfileUser, setBiography,
    setBirthday, setGender, addSocialLink,
    removeSocialLink
} = require("../services/userServices.cjs");
const { deleteAuth } = require("../services/firebaseServices.cjs");
const logger = require("../config/logger.cjs");

// Lấy thông tin người dùng từ
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
    const { uid, friendID } = req.body;
    try {
        const user = await removeFriend(uid, friendID);
        if (!user) return res.status(404).json({ message: 'Hủy kết bạn thất bại!' });
        res.status(200).json({ message: 'Đã hủy kết bạn!' });

    } catch (error) {
        logger.error('Lỗi khi hủy kết bạn!', { uid });
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

// Gửi lời mời kết bạn
async function sendFriendRequest(req, res) {
    const { uid, friendID} = req.body;
    try {
        const user = await friendRequest(uid, friendID);
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
    const { uid, friendID } = req.body;
    try {
        const user = await acceptFriend(uid, friendID);
        if (!user) return res.status(404).json({ message: 'Chấp nhận lời mời thất bại!' });
        res.status(200).json({ message: 'Đã chấp nhận lời mời kết bạn!' });

    } catch (error) {
        logger.error('Lỗi khi chấp nhận lời mời kết bạn!', { uid });
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

// Xóa lời mời kết bạn
async function cancelFriendRequest(req, res) {
    const { uid, friendID } = req.body;
    try {
        const user = await cancelFriend(uid, friendID);
        if (!user) return res.status(404).json({ message: 'Hủy lời mời kết bạn thất bại!' });
        res.status(200).json({ message: 'Đã hủy lời mời kết bạn!' });

    } catch (error) {
        logger.error('Lỗi khi hủy lời mời kết bạn!', { uid });
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

// Xóa lời mời kết bạn
async function recallRequest(req, res) {
    const { uid, friendID } = req.body;
    try {
        const user = await recall(uid, friendID);
        if (!user) return res.status(404).json({ message: 'Thu hồi lời mời kết bạn thất bại!' });
        res.status(200).json({ message: 'Đã thu hồi lời mời kết bạn!' });

    } catch (error) {
        logger.error('Lỗi khi thu hồi lời mời kết bạn!', { uid });
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

// Lấy thông tin hồ sơ
async function getProfile(req, res) {
    const { uid } = req.body;
    try {
        const user = await getProfileUser(uid);
        if (!user) return res.status(404).json({ message: 'Người dùng không tồn tại!' });
        res.status(200).json(user);

    } catch (error) {
        logger.error('Lỗi khi lấy thông tin hồ sơ!', { uid });
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

// Thay đổi mô tả cá nhân
async function changeBiography(req, res) {
    const { uid, biography } = req.body;
    try {
        const user = await setBiography(uid, biography);
        if (!user) return res.status(404).json({ message: 'Cập nhật mô tả cá nhân thất bại!' });
        res.status(200).json({ message: 'Cập nhật mô tả cá nhân thành công!' });

    } catch (error) {
        logger.error('Lỗi khi cập nhật mô tả cá nhân!', { uid });
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

// Thay đổi ngày sinh
async function changeBirthday(req, res) {
    const { uid, birthday } = req.body;
    try {
        const user = await setBirthday(uid, birthday);
        if (!user) return res.status(404).json({ message: 'Cập nhật ngày sinh thất bại!' });
        res.status(200).json({ message: 'Cập nhật ngày sinh thành công!' });

    } catch (error) {
        logger.error('Lỗi khi cập nhật ngày sinh!', { uid });
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

// Thay đổi giới tính
async function changeGender(req, res) {
    const { uid, gender } = req.body;
    try {
        const user = await setGender(uid, gender);
        if (!user) return res.status(404).json({ message: 'Cập nhật giới tính thất bại!' });
        res.status(200).json({ message: 'Cập nhật giới tính thành công!' });

    } catch (error) {
        logger.error('Lỗi khi cập nhật giới tính!', { uid });
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

// Thêm đường liên kết mạng xã hội
async function addSocialLinkFromList(req, res) {
    const { uid, socialLink } = req.body;
    try {
        const user = await addSocialLink(uid, socialLink);
        if (!user) return res.status(404).json({ message: 'Thêm đường liên kết mạng xã hội thất bại!' });
        res.status(200).json({ message: 'Đã thêm đường liên kết mạng xã hội!' });

    } catch (error) {
        logger.error('Lỗi khi thêm đường liên kết mạng xã hội!', { uid });
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

// Xóa đường liên kết mạng xã hội
async function removeSocialLinkFromList(req, res) {
    const { uid, socialLinkId } = req.body;
    try {
        const user = await removeSocialLink(uid, socialLinkId);
        if (!user) return res.status(404).json({ message: 'Xóa đường liên kết mạng xã hội thất bại!' });
        res.status(200).json({ message: 'Đã xóa đường liên kết mạng xã hội!' });

    } catch (error) {
        logger.error('Lỗi khi xóa đường liên kết mạng xã hội!', { uid });
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

module.exports = {
    getUserInfo, changeAvatar, resetPassword,
    changeDisplayName, unfriend, sendFriendRequest,
    acceptFriendRequest, cancelFriendRequest,
    recallRequest, deleteAccount, updateOnline,
    getProfile, changeBiography, changeBirthday,
    changeGender, addSocialLinkFromList,
    removeSocialLinkFromList
};
