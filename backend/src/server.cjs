require("dotenv").config({ path: "../.env" });
const { app, host } = require("./config/appConfig.cjs");  // Import Express app
const { port, protocol } = require("./config/ipConfig.cjs");  // Import port configuration
const authRoutes = require("./routes/authRoutes.cjs");  // Import router auth
const userRoutes = require("./routes/userRoutes.cjs");  // Import router user
const messageRoutes = require("./routes/messageRoutes.cjs");  // Import router message
const indexRoutes = require("./routes/indexRoutes.cjs");  // Import router index
const socialRoutes = require("./routes/socialRoutes.cjs");  // Import router index
const http = require("http");
const server = http.createServer(app);  // Khởi tạo server HTTP
require("./services/socketServices.cjs")(server);  // Tích hợp Socket.IO

// Thiết lập các route của Express
app.use("/api/auth", authRoutes);  // Tức là endpoint sẽ là /api/signup, /api/confirm...
app.use("/api/user", userRoutes);  // Tức là endpoint sẽ là /api/user/...
app.use("/api/message", messageRoutes);  // Tức là endpoint sẽ là /api/message...
app.use("/api/index", indexRoutes);  // Tức là endpoint sẽ là /api/user/...
app.use("/api/social", socialRoutes);  // Tức là endpoint sẽ là /api/social/...

// Khởi động server HTTP và Socket.IO
server.listen(port, host, () => {
    console.log(`Server đang chạy trên ${protocol}://${host}:${port}`);
});
