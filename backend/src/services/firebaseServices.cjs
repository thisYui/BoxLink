const { admin, db } = require("../config/firebaseConfig.cjs");
const logger = require("../config/logger.cjs");

// Tạo người dùng mới
async function createAuth(email, password, displayName) {
    try {
        // Tạo người dùng mới qua Firebase Admin SDK
        const userRecord = await admin.auth().createUser({
            email: email,
            password: password
        });

        // Ghi dữ liệu vào Firestore
        await db.collection("users").doc(userRecord.uid).set({
            displayName: displayName,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            chatList: [],
            avatar: "default.png",
            friendList: [],
            notifications: [] // <typeNotification, srcID, text>
        });

        console.log("Tạo tài khoản thành công và đã lưu Firestore.");
    } catch (error) {
        logger.error("Lỗi khi tạo tài khoản:", error);
        throw error;
    }
}

// Xóa người dùng
async function deleteAuth(uid) {
    try {
        // Xóa người dùng từ Firebase Auth
        await admin.auth().deleteUser(uid);

        // Xóa dữ liệu từ Firestore
        await db.collection("users").doc(uid).delete();

        // Xóa gửi cho bạn bè biết rằng tk ko còn tồn tại

        console.log("Xóa tài khoản thành công.");
    } catch (error) {
        logger.error("Lỗi khi xóa tài khoản:", error);
        throw error;
    }
}

// Tạo cuộc trò chuyện
async function createChat(userId, emailFriend) {
    try {
        // Lấy thông tin người bạn từ email
        const friend = await admin.auth().getUserByEmail(emailFriend);

        // Tạo cuộc trò chuyện trong Firestore
        const chatRef = db.collection("chats").doc();
        const timestamp = admin.firestore.FieldValue.serverTimestamp();
        await chatRef.set({
            participants: [userId, friend.uid],
            seen: {
              [userId]: { lastMessageSeen: timestamp },
              [friend.uid]: { lastMessageSeen: timestamp }
            },
            createdAt: timestamp,
            lastMessage: {}
        });

        // Tạo subcollection "messages" trong document của chat
        const messagesRef = chatRef.collection("messages");

        const messageSystem = {
              senderId: 0,           // ai gửi
              type: "system",          // kiểu tin nhắn
              content: {
                  text: "Bây giờ bạn có thể trò chuyện với nhau!" // nội dung tin nhắn
              },           // nội dung (thay đổi theo type)
              timestamp: timestamp,  // thời gian gửi
              replyTo: 0 // nếu có trả lời
        }

        // Bạn có thể thêm một tin nhắn đầu tiên (nếu cần)
        await messagesRef.add(messageSystem);

        // Cập nhật tin nhắn cuối cùng trong cuộc trò chuyện
        await chatRef.update({
            lastMessage: messageSystem
        });

        // Cập nhật danh sách trò chuyện của người dùng
        await db.collection("users").doc(userId).update({
            chatList: admin.firestore.FieldValue.arrayUnion(chatRef.id),
        });
        await db.collection("users").doc(friend.uid).update({
            chatList: admin.firestore.FieldValue.arrayUnion(chatRef.id),
        });

        // Câp nhật danh sách bạn bè
        await db.collection("users").doc(userId).update({
            friendList: admin.firestore.FieldValue.arrayUnion(friend.uid),
        });
        await db.collection("users").doc(friend.uid).update({
            friendList: admin.firestore.FieldValue.arrayUnion(userId),
        });

        console.log("Cuộc trò chuyện đã được tạo thành công.");
    } catch (error) {
        logger.error("Lỗi khi tạo cuộc trò chuyện:", error);
        throw error;
    }
}

// Xóa cuộc trò chuyện
async function deleteChat(chatId) {
    try {
        // Xóa cuộc trò chuyện trong Firestore
        await db.collection("chats").doc(chatId).delete();

        console.log("Cuộc trò chuyện đã được xóa thành công.");
    } catch (error) {
        logger.error("Lỗi khi xóa cuộc trò chuyện:", error);
        throw error;
    }
}

module.exports = {
    createAuth,
    deleteAuth,
    createChat,
    deleteChat,
};


