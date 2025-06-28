// Cập nhật thời gian online
// Mỗi 1 phút 1 lần
async function updateOnlineTime() {
    const response = await fetch(`${host}/api/user/update-online-time`, {
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
    const response = await fetch(`${host}/api/user/change-avatar`, {
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
    const response = await fetch(`${host}/api/user/change-display-name`, {
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

// Thay đổi email
async function changeEmail(email) {
    const response = await fetch(`${host}/api/auth/change-email`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            uid: localStorage.getItem("uid"),
            email: email
        })
    });

    if (!response.ok) {
        throw new Error("Failed to change email");
    }

    return await response.json();
}

// Xóa tài khoản
async function deleteAccount() {
    const response = await fetch(`${host}/api/user/delete-account`, {
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

    const response = await fetch(`${host}/api/user/${api}`, {
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

    return await response.json();
}

// Lấy profile người dùng
async function getProfileUser(uid) {
    const response = await fetch(`${host}/api/user/get-profile`, {
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

// Thay đổi mật khẩu
async function changePassword(password) {
    const response = await fetch(`${host}/api/user/reset-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            uid: localStorage.getItem("uid"),
            password: password
        })
    });

    if (!response.ok) {
        throw new Error("Failed to change password");
    }

    return await response.json();
}

// Thay đổi ngày sinh
async function changeBirthday(birthday) {
    const response = await fetch(`${host}/api/user/change-birthday`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            uid: localStorage.getItem("uid"),
            birthday: birthday
        })
    });

    if (!response.ok) {
        throw new Error("Failed to change birthday");
    }

    return await response.json();
}

// Thay đổi giới tính
async function changeGender(gender) {
    const response = await fetch(`${host}/api/user/change-gender`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            uid: localStorage.getItem("uid"),
            gender: gender
        })
    });

    if (!response.ok) {
        throw new Error("Failed to change birthday");
    }

    return await response.json();
}

// Thay đổi tiểu sử cá nhân
async function changeBiography(biography) {
    const response = await fetch(`${host}/api/user/change-biography`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            uid: localStorage.getItem("uid"),
            biography: biography
        })
    });

    if (!response.ok) {
        throw new Error("Failed to change birthday");
    }

    return await response.json();
}

// Thêm đường liên kết mạng xã hội
async function operaSocialLink(api, socialLink) {
    // api = add-social-link: thêm đường liên kết mạng xã hội
    //        remove-social-link: xóa đường liên kết mạng xã hội
    const response = await fetch(`${host}/api/user/${api}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            uid: localStorage.getItem("uid"),
            socialLink: socialLink
        })
    });

    if (!response.ok) {
        throw new Error("Failed to add social link");
    }

    return await response.json();
}

async function settingConfig() {
    try {
        const response = await fetch(`${host}/api/index/setting-user`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                uid: localStorage.getItem("uid")
            })
        });

        if (!response.ok) {
            throw new Error("Failed to get setting config");
        }

        return await response.json();
    } catch (error) {
        console.error("Error fetching setting config:", error);
        throw error;
    }
}

async function changeSettingTheme(theme) {
    try {
        const response = await fetch(`${host}/api/index/change-theme`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                uid: localStorage.getItem("uid"),
                theme: theme
            })
        });

        if (!response.ok) {
            throw new Error("Failed to change setting config");
        }

        return await response.json();
    } catch (error) {
        console.error("Error changing setting config:", error);
        throw error;
    }
}

// Thay đổi ngôn ngữ
async function changeSettingLanguage(language) {
    try {
        const response = await fetch(`${host}/api/index/change-language`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                uid: localStorage.getItem("uid"),
                language: language
            })
        });

        if (!response.ok) {
            throw new Error("Failed to change language");
        }

        return await response.json();
    } catch (error) {
        console.error("Error changing language:", error);
        throw error;
    }
}

// Thay đổi thông báo
async function changeSettingNotification(notification) {
    try {
        const response = await fetch(`${host}/api/index/change-notification`, {
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
            throw new Error("Failed to change notification");
        }

        return await response.json();
    } catch (error) {
        console.error("Error changing notification:", error);
        throw error;
    }
}

async function getListFriend(uid) {
    const response = await fetch(`${host}/api/user/get-list-friend`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            uid: uid
        })
    });

    if (!response.ok) {
        throw new Error("Failed to fetch box chat info");
    }

    return await response.json();
}

export {
    updateOnlineTime,
    changeAvatar,
    changeDisplayName,
    changeEmail,
    deleteAccount,
    friend,
    getProfileUser,
    changePassword,
    changeBirthday,
    changeGender,
    changeBiography,
    operaSocialLink,
    settingConfig,
    changeSettingTheme,
    changeSettingLanguage,
    changeSettingNotification,
    getListFriend,
}