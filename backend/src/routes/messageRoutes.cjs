const express = require('express');
const {
    createNewChat,
    removeChat,
} = require('../controllers/messageController.cjs');

const router = express.Router();


router.post('/createChat', createNewChat);
router.post('/removeChat', removeChat);

module.exports = router;