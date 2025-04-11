const { admin, db } = require("../config/firebaseConfig.cjs");
const { app } = require("../config/appConfig.cjs");
const { changePassword,
    changeAvatar,
    changeDisplayName,
    unfriend,
    acceptFriendRequest,
} = require("../services/accountServices.cjs");

// Thay đổi ảnh đại diện

// Thay đổi tên hiển thị

// Lấy danh sách bạn bè

// Hủy kết bạn

// Tìm kiếm bạn bè

// Gửi lời mời kết bạn

// Xác nhận lời mời kết bạn

// Xóa lời mời kết bạn

// Xóa tài khoản

module.exports = {
    // changeAvatar,
    //resetPassword,
    // changeDisplayName,
    // getFriendList,
    // unfriend,
    // searchFriend,
    // sendFriendRequest,
    // acceptFriendRequest,
    // cancelFriendRequest,
    // deleteAccount
};
