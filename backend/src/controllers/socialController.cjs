const { createPost,  deletePost, like,
    unlike, getPost, getAllUrlPosts, getListLiker
} = require('../services/socialServices.cjs');
const { logger } = require('../config/logger.cjs');

async function getSinglePost(req, res) {
    const { uid, postID } = req.body;
    try {
        const post = await getPost(uid, postID);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.status(200).json(post);

    } catch (error) {
        logger.error(`Error fetching post: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function getAllPosts(req, res) {
    const { uid } = req.body;
    try {
        const posts = await getAllUrlPosts(uid);
        res.status(200).json(posts);

    } catch (error) {
        logger.error(`Error fetching posts: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function likePost(req, res) {
    const { uid, postID, likeID } = req.body;
    try {
        const result = await like(uid, postID, likeID);
        if (result) res.status(200).json({ message: 'Post liked successfully' });
        else res.status(400).json({ message: 'Failed to like post' });

    } catch (error) {
        logger.error(`Error liking post: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function unlikePost(req, res) {
    const { uid, postID, likeID } = req.body;
    try {
        const result = await unlike(uid, postID, likeID);
        if (result) res.status(200).json({ message: 'Post unliked successfully' });
        else res.status(400).json({ message: 'Failed to unlike post' });

    } catch (error) {
        logger.error(`Error unliking post: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function upPost(req, res) {
    const { uid, listData, caption, isPublic } = req.body;
    try {
        const result = await createPost(uid, listData, caption, isPublic);
        if (result) res.status(200).json(result);
        else res.status(400).json({ message: 'Failed to update post' });

    } catch (error) {
        logger.error(`Error updating post: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function removePost(req, res) {
    const { uid, postID } = req.body;
    try {
        const result = await deletePost(uid, postID);
        if (result) res.status(200).json({ message: 'Post deleted successfully' });
        else res.status(400).json({ message: 'Failed to delete post' });

    } catch (error) {
        logger.error(`Error deleting post: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
}

async function getListUserLikes(req, res) {
    const { uid, postID } = req.body;
    try {
        const likes = await getListLiker(uid, postID);
        if (likes) res.status(200).json(likes);
        else res.status(404).json({ message: 'No likes found for this post' });

    } catch (error) {
        logger.error(`Error fetching likes: ${error.message}`);
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    getSinglePost,
    getAllPosts,
    likePost,
    unlikePost,
    upPost,
    removePost,
    getListUserLikes
}