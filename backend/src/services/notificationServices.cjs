const { admin, db } = require("../config/firebaseConfig.cjs");
const logger = require("../config/logger.cjs");

// Thông báo tin nhắn
async function messageNotification(srcId, desID, messID) {
    try {
        // Thêm thông báo cho biết có tin nhắn mới
        await db.collection("users").doc(desID).update({
            notifications: admin.firestore.FieldValue.arrayUnion({
                typeNotification: "message",
                srcID: srcId,
                text: messID, // Nội dung là id của document tin nhắn
                timeSend: new Date(),
            })
        });

    } catch (error) {
        logger.error("Lỗi khi gửi thông báo tin nhắn:", error);
        throw error;
    }
}

// Gửi đi thông báo lời mời kết bạn
async function friendRequestNotification(srcId, desID) {
    try {
         const des = await admin.auth().getUser(desID);

         // Thêm thông báo cho biết có lời mời kết bạn
        await db.collection("users").doc(des.uid).update({
            notifications: admin.firestore.FieldValue.arrayUnion({
                typeNotification: "friend-request",
                srcID: srcId,
                text: "Đã gửi lời mời kết bạn",
                timeSend: new Date(),
            })
        });

    } catch (error) {
        logger.error("Lỗi khi gửi lời mời kết bạn:", error);
        throw error;
    }
}

// Thông báo lời mời được chấp nhận
async function friendAcceptNotification(srcId, desID) {
    try {
        const des = await admin.auth().getUser(desID);
        const src = await admin.auth().getUser(srcId);

        // Thêm thông báo cho biết đã chấp nhận lời mời kết bạn
        await db.collection("users").doc(des.uid).update({
            notifications: admin.firestore.FieldValue.arrayUnion({
                typeNotification: "friend-accept",
                srcID: src.uid,
                text: "Đã chấp nhận lời mời kết bạn",
                timeSend: new Date(),
            })
        });

    } catch (error) {
        logger.error("Lỗi khi gửi thông báo chấp nhận lời mời:", error);
        throw error;
    }
}

async function updateUserNotification(srcId, typeNotification) {
    // Cập nhật thông báo cho bạn bè
    // Có 2 loại: avatar-update và display-name-update

    try {
        // Lấy danh sách bạn bè từ Firestore
        const userDoc = await db.collection("users").doc(srcId).get();
        const friendList = userDoc.data().friendList || [];

        // Gửi thông báo đến từng người bạn
        for (const friend of friendList) {
            await db.collection("users").doc(friend).update({
                notifications: admin.firestore.FieldValue.arrayUnion({
                    typeNotification: typeNotification,
                    srcID: srcId,
                    text: "Đã cập nhật ảnh đại diện",
                    timeSend: new Date(),
                })
            });
        }

    } catch (error) {
        logger.error("Lỗi khi gửi thông báo cập nhật ảnh đại diện:", error);
        throw error;
    }
}

async function otherNotification(uid, notification) {
    try {
        await db.collection("users").doc(uid).update({
            notifications: admin.firestore.FieldValue.arrayRemove({
                typeNotification: "other",
                srcID: "system",
                text: notification,
                timeSend: new Date(),
            })
        });
    } catch (error) {
        logger.error("Lỗi khi xóa thông báo:", error);
        throw error;
    }
}

// Xóa thông báo cụ thể
async function deleteNotificationSpecific(uid, notification) {
    try {
        await db.collection("users").doc(uid).update({
            notifications: admin.firestore.FieldValue.arrayRemove(notification)
        });
    } catch (error) {
        logger.error("Lỗi khi xóa thông báo:", error);
        throw error;
    }
}

// Xóa các tin nhắn đã được thông báo
async function deleteMessageNotification(uid) {
    try {
        const userDoc = await db.collection("users").doc(uid).get();
        const notifications = userDoc.data().notifications || [];

        // Tạo một mảng các thông báo cần xóa
        const messagesToDelete = notifications.filter(noti => noti.type === 'message');

        // Nếu không có tin nhắn cần xóa, tức là messagesToDelete là null hoặc không có tin nhắn
        if (messagesToDelete.length === 0) {
            // Xóa toàn bộ thông báo nếu không có thông báo 'message' để xóa
            db.collection("users").doc(uid).update({
                notifications: []
            }).then().catch((error) => {
                logger.error("Error deleting all notifications:", error);
            });
        } else {
            // Cập nhật tất cả thông báo cần xóa trong một lần
            db.collection("users").doc(uid).update({
                notifications: db.firestore.FieldValue.arrayRemove(...messagesToDelete)
            }).then().catch((error) => {
                logger.error("Error deleting messages:", error);
            });
        }

        return true;
    } catch (error) {
        logger.error("Lỗi khi xóa thông báo tin nhắn:", error);
        throw error;
    }
}

module.exports = {
    messageNotification,
    friendRequestNotification,
    friendAcceptNotification,
    updateUserNotification,
    otherNotification,
    deleteNotificationSpecific,
    deleteMessageNotification
}