const express = require("express");
const { getUserInfo,
    changeAvatar,
    resetPassword,
    changeDisplayName,
    unfriend,
    sendFriendRequest,
    acceptFriendRequest,
    cancelFriendRequest,
    recallRequest,
    deleteAccount,
    updateOnline,
    getProfile
} = require("../controllers/userController.cjs");

const router = express.Router();

router.post("/user-info", getUserInfo);
router.post("/friend-request", sendFriendRequest);
router.post("/accept-friend", acceptFriendRequest);
router.post("/cancel-friend", cancelFriendRequest);
router.post("/recall-friend", recallRequest);
router.post("/change-avatar", changeAvatar);
router.post("/change-display-name", changeDisplayName);
router.post("/reset-password", resetPassword);
router.post("/unfriend", unfriend);
router.post("/delete-account", deleteAccount);
router.post("/update-online-time", updateOnline);
router.post("/get-profile", getProfile);

module.exports = router;