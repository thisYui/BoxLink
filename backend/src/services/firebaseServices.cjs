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
            uid: userRecord.uid,
            email: userRecord.email,
            displayName: displayName,
            status: "online",
            createdAt: new Date().toISOString(),
            chatList: [],
            auth: `users/${userRecord.uid}`,
            avatar: "default.png",
            friendList: [],
            notifications: [],
            friendRequest: [],
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
async function createChat(userId, friendId) {
    try {
        // Tạo cuộc trò chuyện trong Firestore
        const chatRef = db.collection("chats").doc();
        await chatRef.set({
            users: [
              {userId: userId, lastMessageSeen: new Date().toISOString()},
              {userId: friendId, lastMessageSeen: new Date().toISOString()}
            ],
            messages: [],
            createdAt: new Date().toISOString(),
        });

        // Cập nhật danh sách trò chuyện của người dùng
        await db.collection("users").doc(userId).update({
            chatList: admin.firestore.FieldValue.arrayUnion(chatRef.id),
        });
        await db.collection("users").doc(friendId).update({
            chatList: admin.firestore.FieldValue.arrayUnion(chatRef.id),
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


