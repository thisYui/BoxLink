// Lấy địa chỉ ip private của máy tính và lưu vào file config.json
const os = require('os');
const fs = require('fs');
const path = require('path');

const protocol = process.env.PROTOCOL || 'http'; // Giao thức mặc định là http nếu không có biến môi trường PROTOCOL
const port = process.env.PORT || 3000; // Cổng mặc định là 3000 nếu không có biến môi trường PORT

function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (let name in interfaces) {
        for (let iface of interfaces[name]) {
          if (iface.family === 'IPv4' && !iface.internal) {
             return iface.address;
          }
       }
   }
   return '127.0.0.1';
}

const ip = getLocalIP();

// Nếu muốn ghi lưu vào file json ở frontend
// const config = {
//     apiUrl: `${protocol}://${ip}:${port}`,
// };
// fs.writeFileSync(
//     path.join(__dirname, '../../../frontend/assets/js/config/ip-private.json'),
//     JSON.stringify(config, null, 2)
// );

module.exports = { ip, port, protocol };