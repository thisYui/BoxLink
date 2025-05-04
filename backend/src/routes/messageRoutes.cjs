const express = require('express');
const {
    createNewChat,
    removeChat,
    startChatSession,
    sendMessages,
    getSingleMessage,
    fetchMessages,
    loadMoreMessages,
    clickDownload,
} = require('../controllers/messageController.cjs');
const {} = require('../controllers/indexController.cjs');

const router = express.Router();

router.post('/create-chat', createNewChat);
router.post('/remove-chat', removeChat);
router.post('/start-chat-session', startChatSession);
router.post('/send-messages', sendMessages);
router.post('/get-single-message', getSingleMessage);
router.get('/fetch-messages', fetchMessages);
router.get('/load-more-messages', loadMoreMessages);
router.post('/download-file', clickDownload);


module.exports = router;