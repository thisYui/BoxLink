require("dotenv").config({ path: '../.env' });
const { config, db, admin } = require("./config/firebaseConfig.cjs");  // Import Firebase
const { app, port } = require("./config/appConfig.cjs");  // Import Express
require("./controllers/authController.cjs");  // Import controller

// Khởi động server
app.listen(port, () => {
    console.log(`Server đang chạy trên http://localhost:${port}`);
});



