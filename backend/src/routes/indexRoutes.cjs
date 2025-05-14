const express = require('express');
const { searchFriend,
    deleteNotification,
    getWebsiteInfo,
    getFriendStatus
} = require("../controllers/indexController.cjs");

const router = express.Router();

router.post("/search", searchFriend);
router.post('delete-notification', deleteNotification);
router.post('/get-website-info', getWebsiteInfo);
router.post('/get-friend-status', getFriendStatus);

module.exports = router;