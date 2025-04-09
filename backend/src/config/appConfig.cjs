const express = require("express");
const cors = require("cors");

const app = express();
const port = 3000;

// Bật CORS cho tất cả origin (có thể giới hạn lại nếu muốn)
app.use(cors({
  origin: "*", // hoặc thay bằng 'http://localhost:5173' nếu muốn giới hạn
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// Middleware xử lý JSON
app.use(express.json());

module.exports = { app, port };
