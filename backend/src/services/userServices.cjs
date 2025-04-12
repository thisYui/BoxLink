const { admin, db } = require("../config/firebaseConfig.cjs");

// Thay đổi mật khẩu
async function setPassword(userUid, newPassword) {
    try {
        // Cập nhật mật khẩu mới
        await admin.auth().updateUser(userUid, {
            password: newPassword,
        });

        return true;
    } catch (error) {
        console.error("Lỗi khi cập nhật mật khẩu:", error);
        return false;
    }
}

// Thay đổi tên hiển thị
async function setDisplayName(uid, displayName) {
    try {
        // Cập nhật tên hiển thị mới
        await db.collection("users").doc(uid).update({
            displayName: displayName,
        });

        return true;
    } catch (error) {
        console.error("Lỗi khi cập nhật tên hiển thị:", error);
        return false;
    }
}

// Thay đổi ảnh đại diện
async function setAvatar(uid, avatar) {
    try {
        // Cập nhật tên hiển thị mới
        await db.collection("users").doc(uid).update({
            avatar: avatar,
        });

        return true;
    } catch (error) {
        console.error("Lỗi khi cập nhật ảnh đại diện:", error);
        return false;
    }
}

// Hủy kết bạn
async function removeFriend(uid, friendId) {
    try {
        // Truy cập document của user trong Firestore
        const userRef = db.collection("users").doc(uid);

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
async function acceptFriend(uid, friendId) {
    try {
        // Truy cập document của user trong Firestore
        const userRef = db.collection("users").doc(uid);

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

// Tìm kiếm người dùng
async function searchUser(email) {
    try {
        // Tìm user từ email
        const userRecord = await admin.auth().getUserByEmail(email);

        // Truy cập document của user trong Firestore
        const userRef = db.collection("users").doc(userRecord.uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            console.log("Không tìm thấy người dùng.");
            return null;
        }

        return userDoc.data();
    } catch (error) {
        console.error("Lỗi khi tìm kiếm người dùng:", error);
        return null;
    }
}

// Gửi lời mời kết bạn
async function friendRequest(uid, friendId) {
    try {
        // Truy cập document của user trong Firestore
        const userRef = db.collection("users").doc(uid);

        // Dùng arrayUnion để thêm friendId vào mảng friendRequests
        await userRef.update({
            friendRequests: admin.firestore.FieldValue.arrayUnion(friendId)
        });

        console.log("Đã gửi lời mời kết bạn thành công.");
        return true;
    } catch (error) {
        console.error("Lỗi khi gửi lời mời kết bạn:", error);
        return false;
    }
}

module.exports = {
    setPassword,
    setDisplayName,
    setAvatar,
    removeFriend,
    acceptFriend,
    searchUser,
    friendRequest,
};