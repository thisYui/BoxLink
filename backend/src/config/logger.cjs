// src/config/logger.cjs
const winston = require('winston');
const path = require('path');

// Đường dẫn tới thư mục 'logs' trong backend
const logDirectory = path.join(__dirname, '../../logs'); // Từ src/config đến logs

// Cấu hình logger
const logger = winston.createLogger({
  level: 'info',  // Mức log mặc định
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
    // Ghi log vào console
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
    // Ghi log vào file
    new winston.transports.File({
      filename: path.join(logDirectory, 'app.log'),  // Ghi vào app.log trong thư mục logs
      level: 'info',
    }),
  ],
});

// Nếu bạn muốn ghi log lỗi vào file riêng
logger.add(new winston.transports.File({
  filename: path.join(logDirectory, 'error.log'),  // Ghi lỗi vào error.log
  level: 'error',
}));

module.exports = logger;
