const express = require("express");
const { generateRandomToken, authenticateToken, removeToken, keepToken, checkStateToken } = require("../services/sessionServices.cjs");
const router = express.Router();

setInterval(() => {
    checkStateToken();
}, 30 * 60 * 1000);  // 30 phút 1 lần

router.post("/log-in-token", (req, res) => {
    const { uid } = req.body;

    // Randomly generate a token for the user
    const token_box_link = generateRandomToken(uid);

    res.status(200).json({
        token_box_link: token_box_link,
    });
});

router.post("/auth-token", (req, res) => {
    const { uid, token_bok_link } = req.body;

    // Check if the token matches the stored token for the user
    const auth = authenticateToken(uid, token_bok_link);

    if (auth) {
        res.status(200).json({ auth: true });

    } else {
        res.status(401).json({ auth: false });
    }
});

router.post("/log-out-token", (req, res) => {
    const { uid } = req.body;

    // Remove the token for the user
    removeToken(uid);
});

router.post("/keep-token", (req, res) => {
    const { uid } = req.body;

    // Keep the token alive by updating its timestamp
    keepToken(uid);
});

module.exports = router


