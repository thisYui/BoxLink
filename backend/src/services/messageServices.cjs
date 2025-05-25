const { admin, db } = require("../config/firebaseConfig.cjs");
const logger = require("../config/logger.cjs");
const { messageNotification } = require("./notificationServices.cjs");
const { uploadFile, getDownloadUrl } = require("./fileServices.cjs");
const mine = require("mime-types");
const { getWebsitePreview, getVideoDuration,formatRichTextFromPlain } = require("./utilityServices.cjs");

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
        "size": 28412,
        "url": "https://example.com/image.jpg", // Đường dẫn đến ảnh
        "storagePath": "chatsID/image.jpg", // Đường dẫn trên Firebase Storage
    }

    type: video
    content {
        "fileName": "video.mp4",
        "duration": 120, // Thời gian video (giây)
        "size": 28412,
        "url": "https://example.com/video.mp4", // Đường dẫn đến video
        "storagePath": "chatsID/video.mp4", // Đường dẫn trên Firebase Storage
    }

    type: link
    content {
        "title": "Link title",
        "url": "https://example.com",
        "description": "Link description",
        "thumbnail": "https://example.com/image.jpg"
    }

    type: rich-text
    "content": [
      {
        "type": "text",
        "text": "Hãy xem "
      },
      {
        "type": "link",
        "text": "https://example.com",
        "url": "https://example.com"
      },
      {
        "type": "text",
        "text": " trang này và "
      },
      {
        "type": "link",
        "text": "https://github.com",
        "url": "https://github.com"
      },
      {
        "type": "text",
        "text": " Github nhé! "
      },
      {
        "type": "emoji",
        "name": "rocket",
        "unicode": "🚀"
      },
      {
        "type": "emoji",
        "name": "fire",
        "unicode": "🔥"
      }
    ]
*/

// Cấu trúc lại dữ liệu
async function formatMessage(type, content, chatID) {
    if (type === "text" || type === "system") {
        return {
            text: content,
        };
    }

    if (type === "link") {
        return getWebsitePreview(content);
    }

    if (type === "rich-text") {
        return formatRichTextFromPlain(content);
    }

    // Chỉ còn lại các loại dữ liệu dạng file
    const filePath = `${chatID}/${content.fileName}`;
    await uploadFile(content.date, filePath); // Tải ảnh lên Firebase Storage

    if (type === "image") {

        return {
            fileName: content.fileName,
            size: content.size,  // Lấy kích thước tệp
            url: await getDownloadUrl(filePath), // Lấy URL tải xuống từ Firebase Storage
            storagePath: filePath, // Đường dẫn trên Firebase Storage
        };
    }

    if (type === "video") {
        return {
            fileName: content.fileName,
            size: content.size,  // Lấy kích thước tệp
            duration: await getVideoDuration(content.fileName), // Lấy thời gian video
            url: await getDownloadUrl(filePath), // Lấy URL tải xuống từ Firebase Storage
            storagePath: filePath, // Đường dẫn trên Firebase Storage
        };
    }

    if (type === "file") {
        return {
            fileName: content.fileName,
            subtype: mine.lookup(filePath), // Lấy loại mime từ tệp
            size: content.size,  // Lấy kích thước tệp
            storagePath: filePath, // Đường dẫn trên Firebase Storage
        };
    }
}

// Tìm chat có sẵn
async function findChat(uid, friendID) {
    try {
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
                participants.includes(friendID)) {
                return chatDoc.id; // Trả về ID của cuộc trò chuyện
            }
        }

        return false;
    } catch (error) {
        logger.error("Lỗi khi tìm kiếm cuộc trò chuyện:", error);
        throw error;
    }
}

//Tìm kiếm cuộc trò chuyện giữa hai người tạo phiên làm việc mới
async function startChat(uid, friendID){
    try {
        const chatID = await findChat(uid, friendID);
        // Cập nhật thời gian trò chuyện
        await db.collection("chats").doc(chatID).update({
            [`seen.${uid}.lastMessageSeen`]: admin.firestore.FieldValue.serverTimestamp()
        });
        
        return chatID; // Trả về ID của cuộc trò chuyện hiện tại

    } catch (error) {
        logger.error("Lỗi khi bắt đầu trò chuyện:", error);
        throw error;
    }
}

// Gửi tin nhắn và đưa tin nhắn lên Firebase
async function sendMessage(chatID, uid, friendID, type, content, replyTo) {
    try {
        const formattedMessage = await formatMessage(type, content, chatID);

        // Định dạng tin nhắn
        const message = {
            senderId: uid,
            type: type,
            content: formattedMessage,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            replyTo: replyTo,
        };

        // Thêm tin nhắn vào subcollection "messages"
        await db.collection("chats").doc(chatID).collection("messages").add(message);

        // Lây ra id của tin nhắn vừa gửi
        const messageDoc = await db.collection("chats").doc(chatID).collection("messages").orderBy("timestamp", "desc").limit(1).get();
        const messID = messageDoc.docs[0].id;

        // Gửi thông báo đến người nhận
        await messageNotification(uid, friendID, messID);

        // Cập nhật tin nhắn cuối cùng và thời gian gửi
        await db.collection("chats").doc(chatID).update({
            lastMessage: message,
            [`seen.${uid}.lastMessageSeen`]: admin.firestore.FieldValue.serverTimestamp(),
        });

    } catch (error) {
        logger.error("Lỗi khi gửi tin nhắn:", error);
        throw error;
    }
}

async function getMessages(chatID, limit = 100) {
    try {
        const messagesRef = db.collection("chats").doc(chatID).collection("messages");
        const snapshot = await messagesRef.orderBy("timestamp", "desc").limit(limit).get();

        const messages = [];
        snapshot.forEach(doc => {
            messages.push({ id: doc.id, ...doc.data() });
        });

        return messages.reverse(); // Hiển thị từ cũ đến mới
    } catch (error) {
        logger.error("Lỗi khi lấy tin nhắn:", error);
        throw error;
    }
}

// Lấy duy nhât một tin nhắn
async function getSingle(uid, srcID, messageID) {
    try {
        // Tìm kiếm cuộc trò chuyện
        const chatFind = await findChat(uid, srcID);
        // Truy cập vào messages subcollection
        const messageDoc = await db.collection("chats").doc(chatFind).collection("messages").doc(messageID).get();
        return messageDoc.data();

    } catch (error) {
        logger.error("Lỗi khi lấy tin nhắn:", error);
        throw error;
    }
}

// Lấy thêm dữ liệu từ messages
async function loadMore(chatID, limit = 100) {
    const messagesRef = db
        .collection("chats")
        .doc(chatID)
        .collection("messages")
        .orderBy("timestamp", "desc")
        .startAfter(lastVisible)
        .limit(limit);

    const snapshot = await messagesRef.get();
    const messages = [];

    snapshot.forEach(doc => {
        messages.push({ id: doc.id, ...doc.data() });
    });

    return messages.reverse(); // Hiển thị từ cũ đến mới
}

module.exports = {
    startChat,
    sendMessage,
    getMessages,
    getSingle,
    loadMore,
}