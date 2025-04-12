const express = require("express");
const { getUserInfo,
    changeAvatar,
    resetPassword,
    changeDisplayName,
    unfriend,
    searchFriend,
    sendFriendRequest,
    acceptFriendRequest,
    cancelFriendRequest,
    deleteAccount
} = require("../controllers/userController.cjs");

const router = express.Router();

router.post("/getUserInfo", getUserInfo);
router.post("/search", searchFriend);
router.post("/friend-request", sendFriendRequest);
router.post("/accept-friend", acceptFriendRequest);
router.post("/cancel-friend", cancelFriendRequest);
router.post("/change-avatar", changeAvatar);
router.post("/change-display-name", changeDisplayName);
router.post("/reset-password", resetPassword);
router.post("/unfriend", unfriend);
router.post("/delete-account", deleteAccount);

module.exports = router;