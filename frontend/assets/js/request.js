
// Lấy thông tin cần thiết khi đăng nhập thành công
async function getUserInfo() {
    // Các thông tin cần thiết  bao gồm
    // 1. Tên người dùng, ảnh đại diện và thông tin tài khoàn
    // 2. Danh sách bạn bè
    // 3. Danh sách lời mời kết bạn và các thông báo khác

    const response = await fetch("http://localhost:3000/api/user-info", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
        }
    });

    if (!response.ok) {
        throw new Error("Failed to fetch user info");
    }

    return await response.json();
}

// Tìm kiếm
async function searchFriend() {
    const response = await fetch("http://localhost:3000/api/search", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        }
    });

    if (!response.ok) {
        throw new Error("Failed to search friend");
    }

    return await response.json();
}

// Gửi lời mời kết bạn
async function sendFriendRequest(uid, userId) {
    const response = await fetch("http://localhost:3000/api/friend-request", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        }
    });

    if (!response.ok) {
        throw new Error("Failed to send friend request");
    }

    return await response.json();
}