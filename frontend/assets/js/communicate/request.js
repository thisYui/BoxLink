// Lấy thông tin cần thiết khi đăng nhập thành công
async function getUserInfo() {
    // Các thông tin cần thiết  bao gồm
    // 1. Tên người dùng, ảnh đại diện và thông tin tài khoàn
    // 2. Danh sách bạn bè và tin nhắn cuối cùng cảu mỗi đoạn chat
    // 3. Danh sách lời mời kết bạn và các thông báo khác

    const response = await fetch("http://localhost:3000/api/user-info", {
        method: "GET",
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
async function searchFriend(emailFriend) {
    const response = await fetch("http://localhost:3000/api/search", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            uid: localStorage.getItem("uid"),
            emailFriend: emailFriend
        })
    });

    if (!response.ok) {
        return {
            displayName: "Không tìm thấy người dùng",
            email: 'no-email',
            avatar: "",
            status: "Không tìm thấy người dùng",
        }
    }

    return await response.json();
}

// Lấy avatar của người dùng
async function getAvatar(friendID) {
    const response = await fetch("http://localhost:3000/api/get-avatar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            friendID: friendID
        })
    });

    if (!response.ok) {
        throw new Error("Failed to fetch avatar");
    }

    return await response.json();
}

// Tương tác bạn bè
async function friend(uid, emailFriend, api){
    // api = { friend-request : gửi lời mời kết bạn
    //         accept-friend: đồng ý kết bạn
    //         cancel-friend: hủy lời mời kết bạn
    // }

    const response = await fetch(`http://localhost:3000/api/${api}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            uid: localStorage.getItem("uid"),
            emailFriend: emailFriend
        })
    });

    if (!response.ok) {
        throw new Error("Failed to send friend request");
    }

    if (api === "friend-request") {
        // Vô hiệu hóa button gửi lời mời kết bạn
    }  else if (api === "accept-friend") {
        // Tạo ngay một chat mới nằm ngay trên đầu danh sách
    } else if (api === "cancel-friend") {
        // Xóa lời mời kết bạn và xóa thông báo
    }
}

// Cập nhật thời gian online
// Mỗi 1 phút 1 lần
window.updateOnlineTime = async function () {
    const response = await fetch("http://localhost:3000/api/update-online-time", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            uid: localStorage.getItem("uid")
        })
    });

    if (!response.ok) {
        throw new Error("Failed to update online time");
    }

    return await response.json();
}

// Các hàm dùng cho socket
window.socketGetUserInfo = getUserInfo;
window.socketFriend = friend;
window.socketGetAvatar = getAvatar;

export {
    getUserInfo,
    searchFriend,
    getAvatar,
    friend,
}