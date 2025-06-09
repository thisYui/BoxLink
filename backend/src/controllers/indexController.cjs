const { searchUserByEmail, searchUserByID, searchByName,
    getWebsitePreview, getLastOnlineObject, friendProfile
} = require("../services/utilityServices.cjs");
const { getDataBoxListChat, settingConfig,
    setTheme, setLanguage, setNotification
} = require("../services/userServices.cjs")
const logger = require("../config/logger.cjs");

// Tìm kiếm bạn bè
async function searchFriend(req, res) {
    const { emailFriend, friendID } = req.body;

    try {
        const user =  (emailFriend === "no-email") ? await searchUserByID(friendID) : await searchUserByEmail(emailFriend);
        if (!user)  return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
        res.status(200).json(user);

    } catch (error) {
        logger.error(`Lỗi khi tìm kiếm bạn bè: ${error.message}`);
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

async function searchFriendByName(req, res) {
    const { name } = req.body;
    try {
        const users = await searchByName(name);
        if (!users || users.length === 0) return res.status(404).json({ message: 'Không tìm thấy người dùng!' });
        res.status(200).json(users);

    } catch (error) {
        logger.error(`Lỗi khi tìm kiếm bạn bè theo tên: ${error.message}`);
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

// Lấy trạng thái online của bạn bè
async function getFriendProfile(req, res) {
    const { uid, friendID } = req.body;

    try {
        const profile = await friendProfile(uid, friendID);
        if (!profile) return res.status(404).json({ message: 'Không tìm thấy thông tin bạn bè!' });
        res.status(200).json(profile);

    } catch (error) {
        logger.error(`Lỗi khi lấy thông tin bạn bè: ${error.message}`);
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

async function getBoxChat(req, res) {
    const { uid, chatID } = req.body;

    try {
        const box = await getDataBoxListChat(chatID, uid);
        if (!box) return res.status(404).json({ message: 'Không tìm thấy danh sách chat!' });
        res.status(200).json(box);

    } catch (error) {
        logger.error(`Lỗi khi lấy danh sách chat: ${error.message}`);
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

// Lấy cấu hình cài đặt người dùng
async function settingUser(req, res) {
    const { uid } = req.body;
    try {
        const config = await settingConfig(uid);
        if (!config) return res.status(404).json({ message: 'Cấu hình không tồn tại!' });
        res.status(200).json(config);

    } catch (error) {
        logger.error('Lỗi khi lấy cấu hình cài đặt người dùng!', { uid });
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

async function setThemeUser(req, res) {
    const { uid, theme } = req.body;
    try {
        const result = await setTheme(uid, theme);
        if (!result) return res.status(404).json({ message: 'Không thể cập nhật chủ đề!' });
        res.status(200).json({ message: 'Cập nhật chủ đề thành công!' });

    } catch (error) {
        logger.error(`Lỗi khi cập nhật chủ đề người dùng: ${error.message}`);
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

async function setLanguageUser(req, res) {
    const { uid, language } = req.body;
    try {
        const result = await setLanguage(uid, language);
        if (!result) return res.status(404).json({ message: 'Không thể cập nhật ngôn ngữ!' });
        res.status(200).json({ message: 'Cập nhật ngôn ngữ thành công!' });

    } catch (error) {
        logger.error(`Lỗi khi cập nhật ngôn ngữ người dùng: ${error.message}`);
        res.status(500).json({ message: 'Lỗi hệ thống!' });
    }
}

async function setNotificationUser(req, res) {
    const {uid, notification} = req.body;
    try {
        const result = await setNotification(uid, notification);
        if (!result) return res.status(404).json({message: 'Không thể cập nhật thông báo!'});
        res.status(200).json({message: 'Cập nhật thông báo thành công!'});

    } catch (error) {
        logger.error(`Lỗi khi cập nhật thông báo người dùng: ${error.message}`);
        res.status(500).json({message: 'Lỗi hệ thống!'});
    }
}

module.exports = {
    searchFriend, getWebsiteInfo,
    getFriendStatus, searchFriendByName,
    getFriendProfile, getBoxChat,
    settingUser, setThemeUser, setLanguageUser,
    setNotificationUser
}