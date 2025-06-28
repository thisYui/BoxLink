# BoxLink
- Dự án này xây dựng một website với các tác vụ nhắn tin cơ bản như gửi tin nhắn, tài liệu và hình ảnh. 
- Dự án này được thực hiện bởi nhóm 2 sinh viên thuộc khóa 23 khoa Công Nghệ Thông Tin của 
trường Đại Học Khoa học Tự nhiên, ĐHQG-TPHCM. Tác giả bao gồm Nguyễn Quang Duy và Văn Đình Hiếu.

## Description
- Dự án này được xây dựng với mục đích học tập và nghiên cứu về các công nghệ web hiện đại như Node.js, Firebase, Socket.io sử dụng HTML, CSS và JavaScript.
- Dự án này được xây dựng với mục đích tạo ra một ứng dụng mạng xã hội đơn giản nhưng đầy đủ chức năng, giúp người dùng có thể giao tiếp và chia sẻ thông tin một cách dễ dàng và nhanh chóng.

## Features
- Feature 1: Có thể tạo tài khoản và đăng nhập.
- Feature 2: Gửi tin nhắn văn bản, tệp và hình ảnh.
- Feature 3: Sử dụng thời gian thực để gửi tin nhắn.
- Feature 4: Có thể đăng bài viết.
- Feature 5: Có thể truy cập web thông qua mạng LAN.
- Feature 6: Có các chức năng tương tự một website nhắn tin như Facebook Messenger, Zalo.

## Requirements
- Operating System: Windows
- Programming Language: HTML, CSS, JavaScript for frontend, Node.js for backend and Firebase for database.
- Dependencies: tải `Node.js` vào thử mục backend khi bạn clone project về máy tính của bạn. 
- Sau đó, bạn cần cài đặt các thư viện cần thiết bằng cách chạy lệnh `npm install` trong thư mục backend.
- Lưu ý rằng bạn cần các thết bị ở trong cùng một mạng LAN để có thể truy cập vào ứng dụng này. Và đảm bảo các thiết bị này có thể `ping` lẫn nhau.

## Secret file
- Bạn cần cung cấp một số thông tin trong `frontend` và `backend` để có thể kết nối đến Firebase.
- Tại `fronend/assets/js/_firebaseConfig.js`, bạn cần cung cấp các thông tin cụ thể trong file yêu cầu.
- Tại `backend`, có bạn tạo 2 file `.env` (copy từ cài đặt firebase) và `serviceAccountKey.json` (lưu từ firebase) để có thể kết nối đến Firebase. Vị trí các file như sau `backend/.env` và `backend/serviceAccountKey.json`.
- Nếu tài khoản Sendgrid của bạn còn hiệu lực vào file `backend/src/services/emailService.js`, hãy uncomment các dòng gửi email đi thay cho console.log

## Operating
- Bước 1: Tải project về máy tính của bạn. 
- Bước 2: Cài đặt Node.js.
- Bước 3: Mở terminal và chuyển đến thư mục backend. Bắt đầu tải các thư viện cần thiết bằng lệnh `npm install`.
- Bước 4: Chạy lệnh `node server.cjs` để khởi động server.
- Bước 5: Dựa vào địa chỉ IP và cổng mà server đang chạy, mở trình duyệt web và truy cập vào địa chỉ đó. Ví dụ: `http://192.168.0.100:3000`
- Bước 6: Đăng nhập vào tài khoản của bạn. Nếu bạn chưa có tài khoản, hãy tạo một tài khoản mới.
- Bước 7: Sau khi đăng nhập thành công, bạn sẽ được chuyển đến trang chính của ứng dụng. 
- Bước 8: Tại đây, bạn có thể gửi tin nhắn văn bản, tệp và hình ảnh cho người dùng khác cũng như tạo các bài viết của riêng mình.
