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
            emailFriend: emailFriend
        })
    });

    if (!response.ok) {
        throw new Error("Failed to search friend");
    }

    const data = await response.json();
    // displayName: userData.displayName,
    // email: userRecord.email,
    // avatar: userData.avatar

    // Che đi ô tìm kiếm và thay bằng account được tìm thấy
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

// Kiểm tra thông báo
async function checkNotification(notifList) {
    const response = await fetch("http://localhost:3000/api/notifications", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            notifList: notifList
        })
    });

    if (!response.ok) {
        throw new Error("Failed to check notification");
    }

    // ListNotification JSON
    // type
    // srcID
    // text
    const listNotification = await response.json();
}