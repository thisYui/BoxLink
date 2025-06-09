const express = require('express');
const { searchFriend, getWebsiteInfo,
    getFriendStatus, searchFriendByName, getFriendProfile,
    getBoxChat, settingUser, setThemeUser, setLanguageUser,
    setNotificationUser
} = require("../controllers/indexController.cjs");

const router = express.Router();

router.post("/search", searchFriend);
router.post("/search-by-name", searchFriendByName);
router.post('/get-website-info', getWebsiteInfo);
router.post('/get-friend-status', getFriendStatus);
router.post('/get-friend-profile', getFriendProfile)
router.post('/get-box-chat', getBoxChat);
router.post('/setting-user', settingUser);
router.post('/change-theme', setThemeUser);
router.post('/change-language', setLanguageUser);
router.post('/change-notification', setNotificationUser);

module.exports = router;