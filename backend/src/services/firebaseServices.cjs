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

        // Tạo post
        await db.collection("posts").doc(userRecord.uid);

        // Ghi dữ liệu vào Firestore
        await db.collection("users").doc(userRecord.uid).set({
            displayName: displayName,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            chatList: [],
            avatar: "assets/images/default-avatar.png",
            biography: "",
            gender: "",
            birthday: "",
            socialLinks: [],
            friendList: [],
            notifications: [], // <typeNotification, srcID, text>
            turnOnNotification: true, // Bật thông báo cho người dùng
            language: "vi", // Ngôn ngữ mặc định
            theme: 0, // Chủ đề mặc định
            friendRequests: [], // <email>
            friendReceived: [], // <email>
            lastOnline: admin.firestore.FieldValue.serverTimestamp(),
        });

        return true; // Trả về true nếu tạo thành công
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

        // Xóa post của người dùng
        const postRef = db.collection("posts").doc(uid);
        const subcollections = await postRef.listCollections();

        for (const subcollection of subcollections) {
            const snapshot = await subcollection.get();
            const deletes = snapshot.docs.map(doc => doc.ref.delete());
            await Promise.all(deletes);
        }

        // Sau khi xóa subcollections, xóa document chính
        await postRef.delete();

        return true;

    } catch (error) {
        logger.error("Lỗi khi xóa tài khoản:", error);
        throw error;
    }
}

// Tạo cuộc trò chuyện
async function createChat(userId, friendID) {
    try {
        // Lấy thông tin người bạn từ email
        const friend = await admin.auth().getUser(friendID);

        // Tạo cuộc trò chuyện trong Firestore
        const chatRef = db.collection("chats").doc();
        const timestamp = admin.firestore.FieldValue.serverTimestamp();
        await chatRef.set({
            participants: [userId, friend.uid],
            info: {
              [userId]: {
                  lastMessageSeen: timestamp,
                  turnOnNotification: true // Bật thông báo cho người dùng
              },
              [friend.uid]: {
                  lastMessageSeen: timestamp,
                  turnOnNotification: true // Bật thông báo cho người bạn
              }
            },
            createdAt: timestamp,
            lastMessage: {}
        });

        // Tạo subcollection "messages" trong document của chat
        const messagesRef = chatRef.collection("messages");

        const messageSystem = {
              senderID: "",           // ai gửi
              type: "system",          // kiểu tin nhắn
              content: {
                  text: "Bây giờ bạn có thể trò chuyện với nhau!" // nội dung tin nhắn
              },           // nội dung (thay đổi theo type)
              timestamp: timestamp,  // thời gian gửi
              replyTo: "" // nếu có trả lời
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

        logger.debug("Cuộc trò chuyện đã được tạo thành công.");

        return chatRef.id; // Trả về ID của cuộc trò chuyện mới tạo
    } catch (error) {
        logger.error("Lỗi khi tạo cuộc trò chuyện:", error);
        throw error;
    }
}

// Xóa cuộc trò chuyện
async function deleteChat(chatId) {
    const chatRef = admin.firestore().collection("chats").doc(chatId);

    try {
        // Lấy danh sách subcollections
        const subcollections = await chatRef.listCollections();

        for (const subcollection of subcollections) {
            const snapshot = await subcollection.get();
            const deletes = snapshot.docs.map(doc => doc.ref.delete());
            await Promise.all(deletes);
        }

        // Sau khi xóa subcollections, xóa document chính
        await chatRef.delete();

        return true;

    } catch (error) {
        console.error("Lỗi khi xóa:", error);
    }
}

module.exports = {
    createAuth,
    deleteAuth,
    createChat,
    deleteChat,
};


