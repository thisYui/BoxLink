const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000; // Cổng mặc định là 3000 nếu không có biến môi trường PORT
const host = process.env.HOST || "127.0.0.1";

// Bật CORS cho tất cả origin (có thể giới hạn lại nếu muốn)
app.use(cors({
  origin: "*", // hoặc thay bằng 'http://localhost:5173' nếu muốn giới hạn
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Middleware xử lý JSON
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../../../frontend/auth.html"));
});

app.use(express.static(path.join(__dirname, "../../../frontend")));

module.exports = { app, port, host};
