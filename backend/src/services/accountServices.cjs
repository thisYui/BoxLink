const { admin, db } = require("../config/firebaseConfig.cjs");

// Thay đổi mật khẩu
async function changePassword(email, newPassword) {
    try {
        // Tìm user từ email
        const userRecord = await admin.auth().getUserByEmail(email);

        // Cập nhật mật khẩu mới
        await admin.auth().updateUser(userRecord.uid, {
            password: newPassword,
        });

        return true;
    } catch (error) {
        console.error("Lỗi khi cập nhật mật khẩu:", error);
        return false;
    }
}

// Thay đổi tên hiển thị
async function changeDisplayName(email, displayName) {
    try {
        // Tìm user từ email
        const userRecord = await admin.auth().getUserByEmail(email);

        // Cập nhật tên hiển thị mới
        await db.collection("users").doc(userRecord.uid).update({
            displayName: displayName,
        });

        return true;
    } catch (error) {
        console.error("Lỗi khi cập nhật tên hiển thị:", error);
        return false;
    }
}

// Thay đổi ảnh đại diện
async function changeAvatar(email, avatar) {
    try {
        // Tìm user từ email
        const userRecord = await admin.auth().getUserByEmail(email);

        // Cập nhật tên hiển thị mới
        await db.collection("users").doc(userRecord.uid).update({
            avatar: avatar,
        });

        return true;
    } catch (error) {
        console.error("Lỗi khi cập nhật ảnh đại diện:", error);
        return false;
    }
}

// Hủy kết bạn
async function unfriend(email, friendId) {
    try {
        // Lấy thông tin user từ email
        const userRecord = await admin.auth().getUserByEmail(email);
        const userId = userRecord.uid;

        // Truy cập document của user trong Firestore
        const userRef = db.collection("users").doc(userId);

        // Dùng arrayRemove để xóa friendId ra khỏi mảng friendList
        await userRef.update({
            friendList: admin.firestore.FieldValue.arrayRemove(friendId)
        });

        console.log("Đã hủy kết bạn thành công.");
        return true;
    } catch (error) {
        console.error("Lỗi khi hủy kết bạn:", error);
        return false;
    }
}

// Chấp nhận lời mời kết bạn
async function acceptFriendRequest(email, friendId) {
    try {
        // Lấy thông tin user từ email
        const userRecord = await admin.auth().getUserByEmail(email);
        const userId = userRecord.uid;

        // Truy cập document của user trong Firestore
        const userRef = db.collection("users").doc(userId);

        // Dùng arrayUnion để thêm friendId vào mảng friendList
        await userRef.update({
            friendList: admin.firestore.FieldValue.arrayUnion(friendId)
        });

        console.log("Đã chấp nhận lời mời kết bạn thành công.");
        return true;
    } catch (error) {
        console.error("Lỗi khi chấp nhận lời mời kết bạn:", error);
        return false;
    }
}

module.exports = {
    changePassword,
    changeDisplayName,
    changeAvatar,
    unfriend,
    acceptFriendRequest,
};