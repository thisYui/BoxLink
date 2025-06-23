const express = require("express");
const { getAllPosts, getSinglePost, upPost, removePost, likePost, unlikePost, getListUserLikes } = require("../controllers/socialController.cjs");
const router = express.Router();

router.post("/get-all-posts", getAllPosts);
router.post("/get-single-post", getSinglePost);
router.post("/up", upPost);
router.post("/remove", removePost);
router.post("/like", likePost);
router.post("/unlike", unlikePost);
router.post("/get-list-user-likes", getListUserLikes);

module.exports = router;