const express = require('express');
const { searchFriend, deleteNotification, getWebsiteInfo,
    getFriendStatus, searchFriendByName, getFriendProfile
} = require("../controllers/indexController.cjs");

const router = express.Router();

router.post("/search", searchFriend);
router.post("/search-by-name", searchFriendByName);
router.post('delete-notification', deleteNotification);
router.post('/get-website-info', getWebsiteInfo);
router.post('/get-friend-status', getFriendStatus);
router.post('/get-friend-profile', getFriendProfile)

module.exports = router;