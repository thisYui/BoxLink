const {admin, db} = require("../config/firebaseConfig.cjs");
const { messageNotification } = require("./notificationServices.cjs");
const { uploadFile } = require("./fileServices.cjs");
const mine = require("mime-types");
const fs = require('fs');
const { getWebsitePreview } = require("./utilityServices.cjs");

let chatCurrent = null;  // Tại một thời điểm chỉ có một cuộc trò chuyện đang mở
let lastVisible = null;  // Lưu lại tin nhắn cuối cùng để load thêm

/*
2. Cloud Firestore:
  Dung lượng lưu trữ: 1 GiB
  Số lượng đọc: 50.000 đọc tài liệu mỗi ngày
  Số lượng ghi: 20.000 ghi tài liệu mỗi ngày
  Số lượng xóa: 20.000 xóa tài liệu mỗi ngày
*/

/**
 * Định dạng tin nhắn tiêu chuẩn
    JSON Message
    {
      "senderId": "user",                // ai gửi
      "type": "text",                       // text | image | file | system | rich_text | ...
      "content": {},                        // nội dung (thay đổi theo type)
      "timestamp": "2025-04-09T15:32:00Z",  // thời gian gửi
      "replyTo": "message_id_optional"      // nếu có trả lời
    }

    type: text và system
    content {
        "text": "Xin chào bạn"
    }

    type: file
    content {
        "fileName": "report.pdf",
        "subtype": file, // file | audio
        "size": 28412,
        "storagePath": "chatsID/report.pdf", // Đường dẫn trên Firebase Storage
    }

    type: image
    content {
        "fileName": "image.jpg",
        "subtype": image, // image | video
        "size": 28412,
        "storagePath": "chatsID/image.jpg", // Đường dẫn trên Firebase Storage
    }

    type: link
    content {
        "title": "Link title",
        "url": "https://example.com",
        "description": "Link description",
        "thumbnail": "https://example.com/image.jpg"
    }

    type: rich_text
    "content": {
      "blocks": [
        { "type": "text", "text": "Xem thêm tại " },
        { "type": "link", "text": "Github", "url": "https://github.com" },
        { "type": "emoji", "name": "rocket", "unicode": "" }
      ]
    }
*/

// Cấu trúc lại dữ liệu
async function formatMessage(type, content) {
    if (type === "text" || type === "system") {
        return {
            text: content,
        };
    }

    if (type === "file" || type === "image") {
        const filePath = `${chatCurrent}/${content.fileName}`;
        await uploadFile(content, filePath); // Tải tệp lên Firebase Storage
        return {
            fileName: content,
            subtype: mine.lookup(content), // Lấy loại mime từ tệp
            size: fs.statSync(content),  // Lấy kích thước tệp
            storagePath: filePath, // Đường dẫn trên Firebase Storage
        };
    }

    if (type === "link") {
        return getWebsitePreview(content);
    }

    if (type === "rich_text") {
        // Xử lý rich text

        return { };
    }
}

//Tìm kiếm cuộc trò chuyện giữa hai người tạo phiên làm việc mới
async function startChat(uid, friendEmail){
    try {
        // Lấy thông tin người nhận
        const receiver = await admin.auth().getUserByEmail(friendEmail);
        const friendId = receiver.uid;

        // Tìm kiếm doccument chatList
        const userDoc = await db.collection("users").doc(uid).get();
        const chatList = userDoc.data().chatList || [];

        for (const chatId of chatList) {
            const chatDoc = await db.collection("chats").doc(chatId).get();
            if (!chatDoc.exists) continue;

            const participants = chatDoc.data().participants;

            // So sánh bất kể thứ tự
            if (participants.length === 2 &&
                participants.includes(uid) &&
                participants.includes(friendId)) {
                // Gán giá trị cho chatCurrent
                chatCurrent = chatDoc.id;
                // Cập nhật thời gian trò chuyện
                await db.collection("chats").doc(chatDoc.id).update({
                    [`seen.${uid}.lastMessageSeen`]: admin.firestore.FieldValue.serverTimestamp()
                });
            }
        }
    } catch (error) {
        console.error("Lỗi khi tìm kiếm cuộc trò chuyện:", error);
        throw error;
    }
}

// Gửi tin nhắn và đưa tin nhắn lên Firebase
async function sendMessage(uid, friendEmail, type, content, replyTo) {
    try {
        const formattedMessage = await formatMessage(type, content);

        // Định dạng tin nhắn
        const message = {
            senderId: uid,
            type: type,
            content: formattedMessage,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            replyTo: replyTo,
        };

        // Thêm tin nhắn vào subcollection "messages"
        await db.collection("chats").doc(chatCurrent).collection("messages").add(message);

        // Gửi thông báo đến người nhận
        await messageNotification(uid, friendEmail);

        // Cập nhật tin nhắn cuối cùng và thời gian gửi
        await db.collection("chats").doc(chatCurrent).update({
            lastMessage: message,
            [`seen.${uid}.lastMessageSeen`]: admin.firestore.FieldValue.serverTimestamp(),
        });

    } catch (error) {
        console.error("Lỗi khi gửi tin nhắn:", error);
        throw error;
    }
}
async function getMessages(limit = 100) {
    try {
        const messagesRef = db.collection("chats").doc(chatCurrent).collection("messages");
        const snapshot = await messagesRef.orderBy("timestamp", "desc").limit(limit).get();

        const messages = [];
        snapshot.forEach(doc => {
            messages.push({ id: doc.id, ...doc.data() });
        });

        lastVisible =  snapshot.docs[snapshot.docs.length - 1] || null; // Lưu lại tin nhắn cuối cùng để load thêm

        return  messages.reverse(); // Hiển thị từ cũ đến mới
    } catch (error) {
        console.error("Lỗi khi lấy danh sách tin nhắn:", error);
        throw error;
    }
}

// Lấy thêm dữ liệu từ messages
async function loadMore(limit = 100) {
    const messagesRef = db
        .collection("chats")
        .doc(chatCurrent)
        .collection("messages")
        .orderBy("timestamp", "desc")
        .startAfter(lastVisible)
        .limit(limit);

    const snapshot = await messagesRef.get();
    const messages = [];

    snapshot.forEach(doc => {
        messages.push({ id: doc.id, ...doc.data() });
    });

    lastVisible = snapshot.docs[snapshot.docs.length - 1] || null; // Lưu lại tin nhắn cuối cùng để load thêm

    return messages.reverse(); // Hiển thị từ cũ đến mới
}

module.exports = {
    startChat,
    sendMessage,
    getMessages,
    loadMore,
}