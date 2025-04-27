const { Server } = require("socket.io");
const { admin, db } = require("../config/firebaseConfig.cjs");

// Lắng nghe thay đổi Firestore
function listenToUserNotifications(userId, onNotificationChange) {
    const userDocRef = db.collection("users").doc(userId);

    // Lắng nghe thay đổi Firestore với onSnapshot
    userDocRef.onSnapshot((doc) => {
        if (!doc.exists) {
            console.log(`Firestore: user ${userId} not found.`);
            return;
        }

        const notifications = doc.data()?.notifications || [];

        // Tạo một mảng các thông báo cần xóa
        const messagesToDelete = notifications.filter(noti => noti.type === 'message');

        // Nếu không có tin nhắn cần xóa, tức là messagesToDelete là null hoặc không có tin nhắn
        if (messagesToDelete.length === 0) {
            // Xóa toàn bộ thông báo nếu không có thông báo 'message' để xóa
            db.collection("users").doc(userId).update({
                notifications: []
            }).then(() => {
                console.log("All notifications deleted");
            }).catch((error) => {
                console.error("Error deleting all notifications:", error);
            });
        } else {
            // Cập nhật tất cả thông báo cần xóa trong một lần
            db.collection("users").doc(userId).update({
                notifications: db.firestore.FieldValue.arrayRemove(...messagesToDelete)
            }).then(() => {
                console.log("Successfully deleted messages");
            }).catch((error) => {
                console.error("Error deleting messages:", error);
            });
        }

        // Gọi callback để thông báo về client
        if (onNotificationChange) {
            onNotificationChange(notifications);
        }
    });
}

module.exports = function (server) {
    const io = new Server(server, {
        cors: {
            origin: "*", // Chỉ nên dùng * khi phát triển
        },
    });

    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);

        // Nhận userId từ client sau khi kết nối
        socket.on("registerUser", ({ uid }) => {
            // Gắn userId vào socket để dùng sau
            socket.userId = uid;

            // Gọi hàm lắng nghe thay đổi từ Firestore
            listenToUserNotifications(uid, (notifications) => {
                // Gửi thông báo cho đúng client
                console.log(`Sending notifications to user ${uid}:`, notifications);
                socket.emit("notifications", {
                    notifications
                });
            });
        });

        socket.on("disconnect", () => {
            console.log(`Client disconnected: ${socket.id}`);

            // Gửi lên database time online cuối cùng
            const userDocRef = db.collection("users").doc(socket.userId);
            userDocRef.update({
                lastOnline: admin.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                console.log(`Updated last online time for user ${socket.userId}`);
            }).catch((error) => {
                console.error(`Error updating last online time for user ${socket.userId}:`, error);
            });
        });
    });

    console.log("Socket.IO server initialized");
};