const { Server } = require("socket.io");
const { db } = require("../config/firebaseConfig.cjs");

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
                socket.emit("notifications", {
                    userId: socket.userId,
                    notifications
                });
            });
        });

        socket.on("disconnect", () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });

    console.log("Socket.IO server initialized");
};