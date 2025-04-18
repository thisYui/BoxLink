const { admin, db } = require("../config/firebaseConfig.cjs");
const { friendRequestNotification, friendAcceptNotification, otherNotification } = require("./notificationServices.cjs");

// Lấy dữ liệu người dùng từ uid
async function getInfo(uid) {
    try {
        const userRecord = await admin.auth().getUser(uid);
        const user = await db.collection("users").doc(uid).get();
        const userData = user.data();

        let friendList = [];
        for (const chatId of userData.chatList) {
            const chatSnapshot = await db.collection("chats").doc(chatId).get();
            const chatData = chatSnapshot.data();

            const friendID = chatData.participants.find(id => id !== uid);
            const friend = await db.collection("users").doc(friendID).get();
            const friendData = friend.data();

            let lastMessage = null;
            const type = chatData.lastMessage.type;

            if (type === "text" || type === "system") {
                lastMessage = chatData.lastMessage.content.text;
            } else if (type === "image") {
                lastMessage = `${friendData.displayName} đã gửi một ảnh`;
            } else if (type === "video") {
                lastMessage = `${friendData.displayName} đã gửi một video`;
            } else if (type === "audio") {
                lastMessage = `${friendData.displayName} đã gửi một audio`;
            } else if (type === "file") {
                lastMessage = `${friendData.displayName} đã gửi một tệp đính kèm`;
            }

            const data = {
                displayName: friendData.displayName,
                email: friendData.email,
                avatar: friendData.avatar, // lưu ý: đang dùng avatar của chính user
                lastMessage: lastMessage,
            };

            friendList.push(data);
        }

        return {
            displayName: userData.displayName,
            email: userRecord.email,
            avatar: userData.avatar,
            friendList: friendList,
        }
    } catch (error) {
        console.error("Lỗi khi lấy thông tin người dùng:", error);
        return null;
    }
}

// Thay đổi mật khẩu
async function setPassword(userUid, newPassword) {
    try {
        // Cập nhật mật khẩu mới
        await admin.auth().updateUser(userUid, {
            password: newPassword,
        });

        // Thông báo cho biết đã thay đổi mật khẩu
        await otherNotification(userUid, "Đã thay đổi mật khẩu");

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

        // Thông báo cho biết đã thay đổi tên hiển thị
        await otherNotification(uid, "Đã thay đổi tên hiển thị");

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

        // Thông báo cho biết đã thay đổi ảnh đại diện
        await otherNotification(uid, "Đã thay đổi ảnh đại diện");

        return true;
    } catch (error) {
        console.error("Lỗi khi cập nhật ảnh đại diện:", error);
        return false;
    }
}

// Hủy kết bạn
async function removeFriend(uid, emailFriend) {
    try {
        const friend = await admin.auth().getUserByEmail(emailFriend);

        // Truy cập document của user trong Firestore
        const userRef = db.collection("users").doc(uid);
        const friendRef = db.collection("users").doc(friend.uid);

        // Dùng arrayRemove để xóa friendId ra khỏi mảng friendList
        await userRef.update({
            friendList: admin.firestore.FieldValue.arrayRemove(friend.uid)
        });

        // Dùng arrayRemove để xóa myId ra khỏi mảng friendList của friend
        await friendRef.update({
            friendList: admin.firestore.FieldValue.arrayRemove(uid)
        });

        console.log("Đã hủy kết bạn thành công.");
        return true;
    } catch (error) {
        console.error("Lỗi khi hủy kết bạn:", error);
        return false;
    }
}

// Chấp nhận lời mời kết bạn
async function acceptFriend(uid, emailFriend) {
    try {
        const friend = await admin.auth().getUserByEmail(emailFriend);

        // Truy cập document của user trong Firestore
        const userRef = db.collection("users").doc(uid);
        const friendRef = db.collection("users").doc(friend.uid);

        // Dùng arrayUnion để thêm friendId vào mảng friendList
        await userRef.update({
            friendList: admin.firestore.FieldValue.arrayUnion(friend.uid)
        });

        // Dùng arrayUnion để thêm myId vào mảng friendList của friend
        await friendRef.update({
            friendList: admin.firestore.FieldValue.arrayUnion(uid)
        });

        // Thông báo cháp nhận lời mời kết bạn
        await friendAcceptNotification(uid, emailFriend);

        console.log("Đã chấp nhận lời mời kết bạn thành công.");
        return true;
    } catch (error) {
        console.error("Lỗi khi chấp nhận lời mời kết bạn:", error);
        return false;
    }
}

// Tìm kiếm người dùng
async function searchUser(uid, email) {
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

        const userData = userDoc.data();

        const user = await admin.auth().getUser(uid);
        // Kiểm tra xem người dùng đã kết bạn hay chưa
        const friendList = userData.friendList || [];  // List email
        const friendRequests = userData.friendRequests || [];  // List email
        const friendReceived = userData.friendReceived || [];  // List email

        let status = "none"; // Trạng thái mặc định là không có gì
        if (friendList.includes(email)) {
            status = "friend"; // Đã kết bạn
        } else if (friendRequests.includes(email)) {
            status = "sender-request"; // Đã gửi lời mời kết bạn
        } else if (friendReceived.includes(email)) {
            status = "receiver-request"; // Đã nhận lời mời kết bạn
        }

        return {
            displayName: userData.displayName,
            email: userRecord.email,
            avatar: userData.avatar,
            status: status
        }
    } catch (error) {
        console.error("Lỗi khi tìm kiếm người dùng:", error);
        return null;
    }
}

// Gửi lời mời kết bạn
async function friendRequest(uid, emailFriend) {
    try {
        const friend = await admin.auth().getUserByEmail(emailFriend);

        // Truy cập document của user trong Firestore
        const userRef = db.collection("users").doc(uid);

        // Dùng arrayUnion để thêm friendId vào mảng friendRequests
        await userRef.update({
            friendRequests: admin.firestore.FieldValue.arrayUnion(friend.uid)
        });

        // Gửi thông báo lời mời kết bạn
        await friendRequestNotification(uid, emailFriend);

        console.log("Đã gửi lời mời kết bạn thành công.");
        return true;
    } catch (error) {
        console.error("Lỗi khi gửi lời mời kết bạn:", error);
        return false;
    }
}

module.exports = {
    getInfo,
    setPassword,
    setDisplayName,
    setAvatar,
    removeFriend,
    acceptFriend,
    searchUser,
    friendRequest,
};