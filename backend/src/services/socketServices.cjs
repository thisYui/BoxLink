const { Server } = require("socket.io");
const { admin, db } = require("../config/firebaseConfig.cjs");
const logger = require("../config/logger.cjs");
const { deleteMessageNotification, deleteSeenMessageNotification } = require("./notificationServices.cjs");

// Đối tượng lưu trữ thông tin về tất cả các kết nối socket của user
const userConnections = {};
// Đối tượng lưu trữ các unsubscribe functions cho các listener
const userListeners = {};

// Lắng nghe thay đổi Firestore
function listenToUserNotifications(io, userId) {
    // Nếu đã có listener cho user này, không cần tạo mới
    if (userListeners[userId]) {
        return;
    }

    const userDocRef = db.collection("users").doc(userId);

    // Lắng nghe thay đổi Firestore với onSnapshot
    // Lưu unsubscribe function để có thể hủy listener khi không cần thiết
    userListeners[userId] = userDocRef.onSnapshot((doc) => {
        if (!doc.exists) {
            logger.error("User document does not exist");
            return;
        }

        const notifications = doc.data()?.notifications || [];

        deleteMessageNotification(userId).then(r => {
            if (!r) {
                logger.error("Error deleting message notification");
            }
        });

        deleteSeenMessageNotification(userId).then(r => {
            if (!r) {
                logger.error("Error deleting seen message notification");
            }
        });

        // Gửi thông báo cho tất cả kết nối của user này
        if (userConnections[userId]) {
            userConnections[userId].forEach(socketId => {
                const socket = io.sockets.sockets.get(socketId);
                if (socket) {
                    socket.emit("notifications", { notifications });
                }
            });
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
        logger.info(`Client connected: ${socket.id}`);

        // Nhận userId từ client sau khi kết nối
        socket.on("registerUser", ({ uid }) => {
            // Gắn userId vào socket để dùng sau
            socket.userId = uid;

            // Thêm socketId vào danh sách kết nối của user
            if (!userConnections[uid]) {
                userConnections[uid] = [];
            }
            userConnections[uid].push(socket.id);

            // Chỉ gọi hàm lắng nghe một lần cho mỗi userId
            listenToUserNotifications(io, uid);

            // Log số lượng kết nối hiện tại của user
            logger.info(`User ${uid} now has ${userConnections[uid].length} active connections`);
        });

        socket.on("disconnect", () => {
            logger.info(`Client disconnected: ${socket.id}`);

            const userId = socket.userId;
            if (userId && userConnections[userId]) {
                // Xóa socket.id khỏi danh sách kết nối của user
                userConnections[userId] = userConnections[userId].filter(id => id !== socket.id);

                // Nếu user không còn kết nối nào, xóa listener để tiết kiệm tài nguyên
                if (userConnections[userId].length === 0) {
                    if (userListeners[userId]) {
                        userListeners[userId]();  // Hủy listener
                        delete userListeners[userId];
                    }
                    delete userConnections[userId];

                    // Gửi lên database time online cuối cùng
                    const userDocRef = db.collection("users").doc(userId);
                    userDocRef.update({
                        lastOnline: admin.firestore.FieldValue.serverTimestamp()
                    }).then().catch((error) => {
                        logger.error(`Error updating last online time for user ${userId}:`, error);
                    });
                } else {
                    logger.info(`User ${userId} still has ${userConnections[userId].length} active connections`);
                }
            }
        });
    });

    logger.info("Socket.IO server initialized");
    return io;  // Trả về io để có thể sử dụng ở nơi khác nếu cần
};

