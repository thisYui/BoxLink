import { host } from "../config/firebaseConfig.js";

// Lấy thông tin cần thiết khi đăng nhập thành công
async function getUserInfo() {
    // Các thông tin cần thiết  bao gồm
    // 1. Tên người dùng, ảnh đại diện và thông tin tài khoàn
    // 2. Danh sách bạn bè và tin nhắn cuối cùng cảu mỗi đoạn chat
    // 3. Danh sách lời mời kết bạn và các thông báo khác

    const response = await fetch(`http://${host}/api/user/user-info`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
            uid: localStorage.getItem("uid")
        })
    });

    if (!response.ok) {
        throw new Error("Failed to fetch user info");
    }

    return await response.json();
}

// Tìm kiếm
async function searchFriendByEmail(emailFriend) {
    const response = await fetch(`http://${host}/api/index/search`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            emailFriend: emailFriend,
            friendID: "no-id"
        })
    });

    if (!response.ok) {
        return {}
    }

    return await response.json();
}

async function searchFriendByID(friendID) {
    const response = await fetch(`http://${host}/api/index/search`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            emailFriend: "no-email",
            friendID: friendID
        })
    });

    if (!response.ok) {
        return {}
    }

    return await response.json();
}

async function searchByName(name) {
    const response = await fetch(`http://${host}/api/index/search-by-name`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            name: name
        })
    });

    if (!response.ok) {
        return [];
    }

    return await response.json();
}

// Lấy các thông tin của 1 hyperlink
async function getHyperlinkInfo(url) {
    const response = await fetch(`http://${host}/api/index/get-website-info`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            url: url
        })
    });

    if (!response.ok) {
        throw new Error("Failed to fetch hyperlink info");
    }

    return await response.json();
}

// Xóa thông báo
async function deleteNotification(notification) {
    const response = await fetch(`http://${host}/api/index/delete-notification`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            uid: localStorage.getItem("uid"),
            notification: notification
        })
    });

    if (!response.ok) {
        throw new Error("Failed to delete notification");
    }

    return await response.json();
}

// Lấy trạng thái online của bạn bè
async function getFriendStatus() {
    const response = await fetch(`http://${host}/api/index/get-friend-status`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            uid: localStorage.getItem("uid"),
        })
    });

    if (!response.ok) {
        throw new Error("Failed to fetch friend status");
    }

    return await response.json();
}

async function getFriendProfile(friendID) {
    const response = await fetch(`http://${host}/api/index/get-friend-profile`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            uid: localStorage.getItem("uid"),
            friendID: friendID
        })
    });

    if (!response.ok) {
        throw new Error("Failed to fetch friend status");
    }

    return await response.json();
}

export {
    getUserInfo,
    searchFriendByEmail,
    searchFriendByID,
    searchByName,
    getHyperlinkInfo,
    deleteNotification,
    getFriendStatus,
    getFriendProfile
}