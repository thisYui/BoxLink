const express = require("express");
const { signUp, confirmOTP,  requestOTP, resetPassword, changeEmailHandler } = require("../controllers/authController.cjs");

const router = express.Router();

router.post("/signup", signUp);
router.post("/confirm", confirmOTP);
router.post("/send-otp", requestOTP);
router.post("/reset-password", resetPassword);
router.post("/change-email", changeEmailHandler);

module.exports = router;