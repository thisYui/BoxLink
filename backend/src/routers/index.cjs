
const sgMail = require('@sendgrid/mail');

// Thay bằng API Key của bạn
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: 'nguyenquangduy048@gmail.com',        // Người nhận
  from: process.env.EMAIL_USER,         // Địa chỉ đã xác minh ở bước Single Sender
  subject: 'Xin chào từ SendGrid!',
  text: 'Đây là nội dung email ở dạng text.',
  html: '<strong>Đây là nội dung email ở dạng HTML</strong>',
};

console.log('EMAIL_USER:', process.env.SENDGRID_SERVER_EMAIL);
console.log('EMAIL_PASS:', process.env.SENDGRID_API_KEY);

// Ví dụ gọi hàm gửi email
// sendEmail('nguyenquangduy048@gmail.com',
//     'Test Subject',
//     'This is a plain text email',
//     '<h1>This is an HTML email</h1>');
