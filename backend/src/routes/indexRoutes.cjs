const express = require('express');
const { getAvatarUser,
    searchFriend,
    deleteNotification
} = require("../controllers/indexController.cjs");

const router = express.Router();

router.post("/search", searchFriend);
router.post("/get-avatar", getAvatarUser);
router.post('delete-notifications', deleteNotification);

module.exports = router;