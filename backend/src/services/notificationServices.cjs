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
                timestamp: new Date(),
                isRead: false // Thêm trường isRead để theo dõi trạng thái đã đọc
            })
        });

    } catch (error) {
        logger.error("Lỗi khi gửi thông báo tin nhắn:", error);
        throw error;
    }
}

// Thông báo đã xem
async function seenMessageNotification(srcID, desID) {
    try {
        // Thêm thông báo cho biết đã xem tin nhắn
        await db.collection("users").doc(desID).update({
            notifications: admin.firestore.FieldValue.arrayUnion({
                typeNotification: "seen-message",
                srcID: srcID,
                text: srcID,
                timestamp: new Date(),
                isRead: true // Thêm trường isRead để theo dõi trạng thái đã đọc
            })
        });

    } catch (error) {
        logger.error("Lỗi khi gửi thông báo đã xem tin nhắn:", error);
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
                timestamp: new Date(),
                isRead: false // Thêm trường isRead để theo dõi trạng thái đã đọc
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
                timestamp: new Date(),
                isRead: false // Thêm trường isRead để theo dõi trạng thái đã đọc
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
                    timestamp: new Date(),
                    isRead: false // Thêm trường isRead để theo dõi trạng thái đã đọc
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
                timestamp: new Date(),
                isRead: false // Thêm trường isRead để theo dõi trạng thái đã đọc
            })
        });
    } catch (error) {
        logger.error("Lỗi khi xóa thông báo:", error);
        throw error;
    }
}

// Xóa tất cả thông báo không thuộc loại friend-request
async function deleteAllNotificationsExceptFriendRequest(uid) {
    try {
        const userDoc = await db.collection("users").doc(uid).get();
        const notifications = userDoc.data().notifications || [];

        if (!notifications || notifications.length === 0) {
            return;
        }

        // Tạo một mảng các thông báo là friend-request
        const notificationsToKeep = notifications.filter(noti => noti.typeNotification === 'friend-request');

        // Cập nhật lại danh sách thông báo
        await db.collection("users").doc(uid).update({
            notifications: notificationsToKeep
        });

    } catch (error) {
        logger.error("Lỗi khi xóa tất cả thông báo không phải là friend-request:", error);
        throw error;
    }
}

// Xóa thông báo thuộc loại friend-request
async function deleteNotificationsFriendRequest(uid, friendID) {
    try {
        const userDoc = await db.collection("users").doc(uid).get();
        const notifications = userDoc.data().notifications || [];

        if (!notifications || notifications.length === 0) {
            return;
        }

        // Tạo một mảng các thông báo là friend-request
        const notificationsRequest = notifications.filter(noti =>
            noti.typeNotification === 'friend-request' && noti.srcID === friendID
        );

        // Cập nhật lại danh sách thông báo
        await db.collection("users").doc(uid).update({
            notifications: admin.firestore.FieldValue.arrayRemove(...notificationsRequest)
        });

    } catch (error) {
        logger.error("Lỗi khi xóa tất cả thông báo không phải là friend-request:", error);
        throw error;
    }
}

async function updateIsReadAllNotifications(uid) {
    try {
        const userDoc = await db.collection("users").doc(uid).get();
        const notifications = userDoc.data().notifications || [];

        for (const notification of notifications) {
            notification.isRead = true; // Cập nhật trạng thái đã đọc
        }

        // Cập nhật lại danh sách thông báo
        await db.collection("users").doc(uid).update({
            notifications: notifications
        });

    } catch (error) {
        logger.error("Lỗi khi cập nhật trạng thái đã đọc cho tất cả thông báo:", error);
        throw error;
    }
}

module.exports = {
    messageNotification,
    seenMessageNotification,
    friendRequestNotification,
    friendAcceptNotification,
    updateUserNotification,
    otherNotification,
    deleteAllNotificationsExceptFriendRequest,
    deleteNotificationsFriendRequest,
    updateIsReadAllNotifications
}