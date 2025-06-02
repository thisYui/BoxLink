const express = require('express');
const {
    createNewChat,
    removeChat,
    startChatSession,
    sendMessages,
    getSingleMessage,
    updateSeenMessage,
    fetchMessages,
    loadMoreMessages,
    clickDownload,
    toggleNotification
} = require('../controllers/messageController.cjs');
const {} = require('../controllers/indexController.cjs');

const router = express.Router();

router.post('/create-chat', createNewChat);
router.post('/remove-chat', removeChat);
router.post('/start-chat-session', startChatSession);
router.post('/send-messages', sendMessages);
router.post('/get-single-message', getSingleMessage);
router.post('/update-seen-message', updateSeenMessage);
router.post('/fetch-messages', fetchMessages);
router.post('/load-more-messages', loadMoreMessages);
router.post('/download-file', clickDownload);
router.post('/toggle-notification', toggleNotification);


module.exports = router;