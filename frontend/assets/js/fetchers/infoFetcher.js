// Cập nhật thời gian online
// Mỗi 1 phút 1 lần
async function updateOnlineTime() {
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

// Thay đổi ảnh đại diện
async function changeAvatar(avatar) {
    const response = await fetch("http://localhost:3000/api/change-avatar", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            uid: localStorage.getItem("uid"),
            avatar: avatar
        })
    });

    if (!response.ok) {
        throw new Error("Failed to change avatar");
    }

    return await response.json();
}

// Thay đổi tên hiển thị
async function changeDisplayName(displayName) {
    const response = await fetch("http://localhost:3000/api/change-display-name", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            uid: localStorage.getItem("uid"),
            displayName: displayName
        })
    });

    if (!response.ok) {
        throw new Error("Failed to change display name");
    }

    return await response.json();
}

// Xóa tài khoản
async function deleteAccount() {
    const response = await fetch("http://localhost:3000/api/delete-account", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            uid: localStorage.getItem("uid")
        })
    });

    if (!response.ok) {
        throw new Error("Failed to delete account");
    }

    return await response.json();
}

// Tương tác bạn bè
async function friend(uid, friendID, api){
    // api =  friend-request : gửi lời mời kết bạn
    //        accept-friend: đồng ý kết bạn
    //        cancel-friend: hủy lời mời kết bạn

    const response = await fetch(`http://localhost:3000/api/${api}`, {
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

// Xóa bạn bè
async function unfriend(uid, emailFriend) {
    const response = await fetch("http://localhost:3000/api/unfriend", {
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
        throw new Error("Failed to unfriend");
    }

    return await response.json();
}

// Lấy profile người dùng
async function getProfileUser(uid) {
    const response = await fetch(`http://localhost:3000/api/profile/get-profile`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            uid: uid,
        })
    });

    if (!response.ok) {
        throw new Error("Failed to get profile");
    }

    return await response.json();
}

export {
    updateOnlineTime,
    changeAvatar,
    changeDisplayName,
    deleteAccount,
    friend,
    unfriend,
    getProfileUser
}