const { admin, db } = require("../config/firebaseConfig.cjs");

// Thông báo tin nhắn
async function messageNotification(srcId, desID, messID) {
    try {
        // Thêm thông báo cho biết có tin nhắn mới
        await db.collection("users").doc(desID).update({
            notifications: admin.firestore.FieldValue.arrayUnion({
                typeNotification: "message",
                srcID: srcId,
                text: messID, // Nội dung là id của document tin nhắn
            })
        });

    } catch (error) {
        console.error("Lỗi khi gửi thông báo tin nhắn:", error);
        throw error;
    }
}

// Gửi đi thông báo lời mời kết bạn
async function friendRequestNotification(srcId, desEmail) {
    try {
         const des = await admin.auth().getUserByEmail(desEmail);

         // Thêm thông báo cho biết có lời mời kết bạn
        await db.collection("users").doc(des.uid).update({
            notifications: admin.firestore.FieldValue.arrayUnion({
                typeNotification: "friend-request",
                srcID: srcId,
                text: "Đã gửi lời mời kết bạn"
            })
        });

    } catch (error) {
        console.error("Lỗi khi gửi lời mời kết bạn:", error);
        throw error;
    }
}

// Thông báo lời mời được chấp nhận
async function friendAcceptNotification(srcId, desEmail) {
    try {
        const des = await admin.auth().getUserByEmail(desEmail);
        const src = await admin.auth().getUser(srcId);

        // Thêm thông báo cho biết đã chấp nhận lời mời kết bạn
        await db.collection("users").doc(des.uid).update({
            notifications: admin.firestore.FieldValue.arrayUnion({
                typeNotification: "friend-accept",
                srcID: src.uid,
                text: "Đã chấp nhận lời mời kết bạn"
            })
        });

    } catch (error) {
        console.error("Lỗi khi gửi thông báo chấp nhận lời mời:", error);
        throw error;
    }
}

async function updateAvatarNotification(srcId) {
    try {
        // Lấy danh sách bạn bè từ Firestore
        const userDoc = await db.collection("users").doc(srcId).get();
        const friendList = userDoc.data().friendList || [];

        // Gửi thông báo đến từng người bạn
        for (const friend of friendList) {
            await db.collection("users").doc(friend).update({
                notifications: admin.firestore.FieldValue.arrayUnion({
                    typeNotification: "avatar-update",
                    srcID: srcId,
                    text: "Đã cập nhật ảnh đại diện"
                })
            });
        }

    } catch (error) {
        console.error("Lỗi khi gửi thông báo cập nhật ảnh đại diện:", error);
        throw error;
    }
}

async function otherNotification(uid, notification) {
    try {
        await db.collection("users").doc(uid).update({
            notifications: admin.firestore.FieldValue.arrayRemove({
                typeNotification: "other",
                srcID: "system",
                text: notification
            })
        });
    } catch (error) {
        console.error("Lỗi khi xóa thông báo:", error);
        throw error;
    }
}

module.exports = {
    messageNotification,
    friendRequestNotification,
    friendAcceptNotification,
    updateAvatarNotification,
    otherNotification
}