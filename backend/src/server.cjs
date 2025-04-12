require("dotenv").config({ path: '../.env' });
const { app, port } = require("./config/appConfig.cjs");  // Import Express
require("./services/socketServices.cjs");  // Import SocketService
const authRoutes = require("./routes/authRoutes.cjs");  // Import router auth
const userRoutes = require("./routes/userRoutes.cjs");  // Import router user
const messageRoutes = require("./routes/messageRoutes.cjs");  // Import router message


app.use("/api", authRoutes);  // Tức là endpoint sẽ là /api/signup, /api/confirm...
app.use("/api", userRoutes);  // Tức là endpoint sẽ là /api/user/...
app.use("/api", messageRoutes);  // Tức là endpoint sẽ là /api/message/...


// Khởi động server
app.listen(port, () => {
    console.log(`Server đang chạy trên http://localhost:${port}`);
});


