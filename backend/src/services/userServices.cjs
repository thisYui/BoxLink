const { admin, db } = require("../config/firebaseConfig.cjs");
const logger = require("../config/logger.cjs");
const { friendRequestNotification, friendAcceptNotification,
    updateUserNotification, otherNotification } = require("./notificationServices.cjs");
const { uploadFile, getDownloadUrl } = require("./fileServices.cjs");

// Lấy thông tin 1 box chat
async function getDataBoxListChat(chatId, uid) {
    try {
        const chatSnapshot = await db.collection("chats").doc(chatId).get();
        const chatData = chatSnapshot.data();

        const friendID = chatData.participants.find(id => id !== uid);
        const friend = await db.collection("users").doc(friendID).get();
        const friendData = friend.data();

        let text = null;
        const type = chatData.lastMessage.type;

        if (type === "text" || type === "system") {
            text = chatData.lastMessage.content.text;
        } else if (type === "image") {
            text = `${friendData.displayName} đã gửi một ảnh`;
        } else if (type === "video") {
            text = `${friendData.displayName} đã gửi một video`;
        } else if (type === "audio") {
            text = `${friendData.displayName} đã gửi một audio`;
        } else if (type === "file") {
            text = `${friendData.displayName} đã gửi một tệp đính kèm`;
        }

        const timeSeen = chatData.info[friendID]?.lastMessageSeen;
        const clientTimeSeen = chatData.info[uid]?.lastMessageSeen;
        const stateNotification = chatData.info[friendID]?.turnOnNotification;

        return {
            displayName: friendData.displayName,
            uid: friendID,
            avatar: friendData.avatar, // lưu ý: đang dùng avatar của chính user
            lastMessage: {
                senderID: chatData.lastMessage.senderID,
                text: text,
                timeSend: chatData.lastMessage.timestamp,
                timeSeen: timeSeen,
                clientTimeSeen: clientTimeSeen
            },
            lastOnline: friendData.lastOnline,
            stateNotification: stateNotification || true, // nếu không có thì mặc định là true
        };

    } catch (error) {
        logger.error("Lỗi khi lấy dữ liệu box chat:", error);
        return null;
    }
}

// Lấy dữ liệu người dùng từ uid
async function getInfo(uid) {
    try {
        const user = await db.collection("users").doc(uid).get();
        const userData = user.data();

        let friendList = [];
        for (const chatId of userData.chatList) {
            const data = await getDataBoxListChat(chatId, uid);
            friendList.push(data);
        }

        return {
            avatar: userData.avatar,
            friendList: friendList,
        }

    } catch (error) {
        logger.error("Lỗi khi lấy thông tin người dùng:", error);
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
        logger.error("Lỗi khi cập nhật mật khẩu:", error);
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

        // Cập nhật tên hiển thị cho tất cả bạn bè
        await updateUserNotification(uid, "display-name-update");

        return true;

    } catch (error) {
        logger.error("Lỗi khi cập nhật tên hiển thị:", error);
        return false;
    }
}

// Thay đổi ảnh đại diện
async function setAvatar(uid, avatar) {
    try {
        // Đưa hình ảnh lên Firebase Storage
        await uploadFile(avatar, uid);  // lấy uid đặt tên file

        // Lấy link tải về
        const url = await getDownloadUrl(avatar);

        // Cập nhật tên hiển thị mới
        await db.collection("users").doc(uid).update({
            avatar: url,
        });

        // Thông báo cho biết đã thay đổi ảnh đại diện
        await otherNotification(uid, "Đã thay đổi ảnh đại diện");

        // Cập nhật ảnh đại diện cho tất cả bạn bè
        await updateUserNotification(uid, "avatar-update");

        return true;

    } catch (error) {
        logger.error("Lỗi khi cập nhật ảnh đại diện:", error);
        return false;
    }
}

// Hủy kết bạn
async function removeFriend(uid, friendID) {
    try {
        // Lấy thông tin bạn bè từ uid
        const friend = await admin.auth().getUser(friendID);

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

        return true;

    } catch (error) {
        logger.error("Lỗi khi hủy kết bạn:", error);
        return false;
    }
}

// Chấp nhận lời mời kết bạn
async function acceptFriend(uid, friendID) {
    try {
        // Lấy thông tin bạn bè từ uid
        const friend = await admin.auth().getUser(friendID);

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

        // Xóa friendID khỏi mảng friendReceived của user
        await userRef.update({
            friendReceived: admin.firestore.FieldValue.arrayRemove(friendID)
        });

        // Xóa uid khỏi mảng friendRequests của friend
        await friendRef.update({
            friendRequests: admin.firestore.FieldValue.arrayRemove(uid)
        });

        // Thông báo cháp nhận lời mời kết bạn
        await friendAcceptNotification(uid, friendID);

        return true;

    } catch (error) {
        logger.error("Lỗi khi chấp nhận lời mời kết bạn:", error);
        return false;
    }
}

// Gửi lời mời kết bạn
async function friendRequest(uid, friendID) {
    try {
        // Lấy thông tin bạn bè từ uid
        const friend = await admin.auth().getUser(friendID);

        // Truy cập document của user trong Firestore
        const userRef = db.collection("users").doc(uid);

        // Dùng arrayUnion để thêm friendId vào mảng friendRequests
        await userRef.update({
            friendRequests: admin.firestore.FieldValue.arrayUnion(friend.uid)
        });

        // Thêm vào mảng friendReceived của friend
        const friendRef = db.collection("users").doc(friend.uid);
        await friendRef.update({
            friendReceived: admin.firestore.FieldValue.arrayUnion(uid)
        });

        // Gửi thông báo lời mời kết bạn
        await friendRequestNotification(uid, friendID);

        return true;

    } catch (error) {
        logger.error("Lỗi khi gửi lời mời kết bạn:", error);
        return false;
    }
}

// Xóa lời mời kết bạn
async function cancelFriend(uid, friendID) {
    try {
        // Truy cập document của user trong Firestore
        const userRef = db.collection("users").doc(uid);
        const friendRef = db.collection("users").doc(friendID);

        // Dùng arrayRemove để xóa friendId ra khỏi mảng friendReceived
        await userRef.update({
            friendReceived: admin.firestore.FieldValue.arrayRemove(friendID)
        });

        // Dùng arrayRemove để xóa myId ra khỏi mảng friendRequest của friend
        await friendRef.update({
            friendRequests: admin.firestore.FieldValue.arrayRemove(uid)
        });

        return true;

    } catch (error) {
        logger.error("Lỗi khi hủy lời mời kết bạn:", error);
        return false;
    }
}

// Thu hồi lời mời kết bạn
async function recall(uid, friendID) {
    try {
        // Hủy lời mời kết bạn từ người nhận
        return await cancelFriend(friendID, uid);

    } catch (error) {
        logger.error("Lỗi khi thu hồi lời mời kết bạn:", error);
        return false;
    }
}

// Cập nhật thời gian online
async function updateLastOnline(uid) {
    try {
        // Cập nhật thời gian online
        await db.collection("users").doc(uid).update({
            lastOnline: admin.firestore.FieldValue.serverTimestamp(),
        });

        return true;

    } catch (error) {
        logger.error("Lỗi khi cập nhật thời gian online:", error);
        return false;
    }
}

// Lấy profile của một người dùng
async function getProfileUser(uid) {
    try {
        const user = await db.collection("users").doc(uid).get();
        const userData = user.data();

        return {
            uid: user.id,
            displayName: userData.displayName,
            email: userData.email,
            avatar: userData.avatar,
            listFriend: userData.friendList,
            countFriends: userData.friendList.length,
            biography: userData.biography,
            gender: userData.gender,
            birthday: userData.birthday,
            socialLinks: userData.socialLinks,
            createdAt: userData.createdAt,
        };

    } catch (error) {
        logger.error("Lỗi khi lấy thông tin người dùng:", error);
        return null;
    }
}

async function setGender(uid, gender) {
    try {
        // Cập nhật giới tính mới
        await db.collection("users").doc(uid).update({
            gender: gender
        });
        return true;

    } catch (error) {
        logger.error("Lỗi khi cập nhật giới tính:", error);
        return false;
    }
}

async function setBirthday(uid, birthday) {
    try {
        // Cập nhật ngày sinh mới
        await db.collection("users").doc(uid).update({
            birthday: birthday
        });
        return true;

    } catch (error) {
        logger.error("Lỗi khi cập nhật ngày sinh:", error);
        return false;
    }
}

async function setBiography(uid, biography) {
    try {
        // Cập nhật mô tả cá nhân mới
        await db.collection("users").doc(uid).update({
            biography: biography // Kiểu date
        });
        return true;

    } catch (error) {
        logger.error("Lỗi khi cập nhật mô tả cá nhân:", error);
        return false;
    }
}

async function addSocialLink(uid, socialLink) {
    try {
        // Thêm đường liên kết mạng xã hội
        await db.collection("users").doc(uid).update({
            socialLinks: admin.firestore.FieldValue.arrayUnion(socialLink)
        });
        return true;

    } catch (error) {
        logger.error("Lỗi khi thêm đường liên kết mạng xã hội:", error);
        return false;
    }
}

async function removeSocialLink(uid, socialLinkId) {
    try {
        // Xóa đường liên kết mạng xã hội
        await db.collection("users").doc(uid).update({
            socialLinks: admin.firestore.FieldValue.arrayRemove(socialLinkId)
        });
        return true;

    } catch (error) {
        logger.error("Lỗi khi xóa đường liên kết mạng xã hội:", error);
        return false;
    }
}

module.exports = {
    getInfo, setPassword, setDisplayName,
    setAvatar, removeFriend, acceptFriend,
    friendRequest, cancelFriend, recall,
    updateLastOnline, getProfileUser,
    setGender, setBirthday, setBiography,
    addSocialLink, removeSocialLink,
    getDataBoxListChat
};