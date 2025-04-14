const express = require('express');
const {
    createNewChat,
    removeChat,
    startChatSession,
    sendMessages,
    fetchMessages,
    loadMoreMessages
} = require('../controllers/messageController.cjs');

const router = express.Router();

router.post('/createChat', createNewChat);
router.post('/removeChat', removeChat);
router.post('/startChatSession', startChatSession);
router.post('/sendMessages', sendMessages);
router.get('/fetchMessages', fetchMessages);
router.get('/loadMoreMessages', loadMoreMessages);

module.exports = router;