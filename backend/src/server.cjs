require("dotenv").config({ path: '../.env' });
const { app, port } = require("./config/appConfig.cjs");  // Import Express
const authRoutes = require("./routes/authRoutes.cjs");  // Import router

// Gắn router vào prefix, ví dụ "/api"
app.use("/api", authRoutes);  // Tức là endpoint sẽ là /api/signup, /api/confirm...

// Khởi động server
app.listen(port, () => {
    console.log(`Server đang chạy trên http://localhost:${port}`);
});



