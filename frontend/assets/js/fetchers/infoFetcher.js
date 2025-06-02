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
    //        unfriend: xóa bạn bè
    //        recall-friend: thu hồi lời mời kết bạn

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
}

// Lấy profile người dùng
async function getProfileUser(uid) {
    const response = await fetch(`http://localhost:3000/api/get-profile`, {
        method: "POST",
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
    getProfileUser
}