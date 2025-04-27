const express = require("express");
const { getUserInfo,
    changeAvatar,
    getAvatarUser,
    resetPassword,
    changeDisplayName,
    unfriend,
    searchFriend,
    sendFriendRequest,
    acceptFriendRequest,
    cancelFriendRequest,
    deleteAccount,
    updateOnline
} = require("../controllers/userController.cjs");

const router = express.Router();

router.post("/user-info", getUserInfo);
router.post("/search", searchFriend);
router.post("/friend-request", sendFriendRequest);
router.post("/accept-friend", acceptFriendRequest);
router.post("/cancel-friend", cancelFriendRequest);
router.post("/change-avatar", changeAvatar);
router.post("/get-avatar", getAvatarUser);
router.post("/change-display-name", changeDisplayName);
router.post("/reset-password", resetPassword);
router.post("/unfriend", unfriend);
router.post("/delete-account", deleteAccount);
router.post("/update-online-time", updateOnline);

module.exports = router;