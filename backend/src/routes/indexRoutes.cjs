const express = require('express');
const { searchFriend, getWebsiteInfo,
    getFriendStatus, searchFriendByName, getFriendProfile,
    getBoxChat
} = require("../controllers/indexController.cjs");

const router = express.Router();

router.post("/search", searchFriend);
router.post("/search-by-name", searchFriendByName);
router.post('/get-website-info', getWebsiteInfo);
router.post('/get-friend-status', getFriendStatus);
router.post('/get-friend-profile', getFriendProfile)
router.post('/get-box-chat', getBoxChat);

module.exports = router;