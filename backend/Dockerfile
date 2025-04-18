# Sử dụng Node.js base image
FROM node:18

# Thiết lập thư mục làm việc trong container
WORKDIR /app

# Copy package.json và package-lock.json trước (tăng hiệu suất cache)
COPY package*.json ./

# Cài đặt dependency
RUN npm install

# Copy toàn bộ mã nguồn
COPY . .

# Chạy ứng dụng
CMD ["node", "src/server.cjs"]
