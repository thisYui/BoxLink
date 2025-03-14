const express = require("express");
const { signUp, verifyEmail } = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signUp);
router.post("/verify-email", verifyEmail);

module.exports = router;
