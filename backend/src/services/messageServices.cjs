const {admin, db} = require("../config/firebaseConfig.cjs");
const { messageNotification, otherNotification } = require("./notificationServices.cjs");

// Format message
async function formatMessage(uid, friendEmail, message) {
    try {
        // Lấy thông tin người gửi
        const sender = await admin.auth().getUser(uid);
        const senderEmail = sender.email;

        // Lấy thông tin người nhận
        const receiver = await admin.auth().getUserByEmail(friendEmail);
        const receiverEmail = receiver.email;

        /*// Tìm kiếm doccument ứng với 2 uid
        await db.collection("users").doc(uid).where()
            {

            }
        )

        // Tạo đối tượng tin nhắn
        const newMessage = {
            chatId: ,
            senderId: uid,
            type: message.type,
            content: message.content,
            timestamp: new Date().toISOString(),
            status: "sent",
            replyTo: message.replyTo || null,
        };*/

        // Gửi thông báo cho người nhận
        await messageNotification(uid, receiverEmail);

        return newMessage;
    } catch (error) {
        console.error("Lỗi khi định dạng tin nhắn:", error);
        throw error;
    }
}

// Đưa tin nhắn lên Firebase

/*
JSON Message
{
  "_id": "ObjectId",
  "chatId": "123456789",            // thuộc cuộc hội thoại nào
  "senderId": "user_abc",           // ai gửi
  "type": "text",                   // text | image | file | system | rich_text | ...
  "content": {},                    // nội dung (thay đổi theo type)
  "timestamp": "2025-04-09T15:32:00Z",  // thời gian gửi
  "status": "sent",                 // sent | delivered | seen
  "replyTo": "message_id_optional" // nếu có trả lời
}

"content": {
  "blocks": [
    { "type": "text", "text": "Xem thêm tại " },
    { "type": "link", "text": "Github", "url": "https://github.com" },
    { "type": "emoji", "name": "rocket", "unicode": "" }
  ]
}
"content": {
  "fileName": "report.pdf",
  "size": 28412,
  "url": "https://cdn.domain.com/files/report.pdf"
}

*
* */

