const express = require('express');
const { getAvatarUser,
    searchFriend,
    deleteNotification,
    getWebsiteInfo
} = require("../controllers/indexController.cjs");

const router = express.Router();

router.post("/search", searchFriend);
router.post("/get-avatar", getAvatarUser);
router.post('delete-notifications', deleteNotification);
router.post('/get-website-info', getWebsiteInfo);

module.exports = router;