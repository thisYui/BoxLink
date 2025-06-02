import { getMyProfile, setAvatar, setDisplayName } from "../user/personalProfile.js";
import { convertToDate } from "../utils/renderData.js";

window.loadProfile = async function () {
    const profile = await getMyProfile();
    console.log(profile)
    showMyProfile(profile);
}

window.fixedElement = function () {
    // Chuyển trang hiện tại thành dạng có thể chỉnh sửa
    // Ngoại trừ email không thể sửa các dữ liệu avatar, display name, tiểu sử, birthday
    // Làm mờ các trường dữ liệu trên cho thấy có thể bị chỉnh sửa

}

window.stopFixedElement = function () {
    // Chuyển trang hiện tại thành dạng không thể chỉnh sửa
    // Lưu lại các thay đổi
}

window.changeDisplayNameAccount = function (event) {

}

window.changeAvatarAccount = function (event) {

}

function showMyProfile(profile) {
    // displayName: userData.displayName,
    // email: userData.email,
    // avatar: userData.avatar,
    // listFriend: userData.friendList,
    // countFriends: userData.friendList.length,
    // biography: userData.biography,
    // gender: userData.gender,
    // birthday: userData.birthday,
    // socialLinks: userData.socialLinks,
    // createdAt: userData.createdAt,
    // countFriendMutual: userData.countFriendMutual, (myprofile có giá trị -1)

    // Cập nhật thông tin cơ bản của người dùng
    const profileAvatar = document.querySelector(".profile-body-basic-info-avatar");
    const profileName = document.querySelector(".profile-name");
    const profileEmail = document.querySelector(".profile-email");
    const profileDescription = document.querySelector(".profile-description");

    // Cập nhật thông tin cá nhân
    const profileGender = document.querySelector(".profile-gender");
    const profileBirth = document.querySelector(".profile-birth");
    const profileLink = document.querySelector(".profile-link");

    // Cập nhật thông tin bổ sung
    const profileStartedDay = document.querySelector(".profile-started-day");
    const profileFriendNum = document.querySelector(".profile-friend-num");
    const profileDayNum = document.querySelector(".profile-day-num");

    // Nút chỉnh sửa
    const editProfileButton = document.querySelector(".edit-profile-button");

    // Cập nhật thông tin cơ bản
    if (profileAvatar) {
        profileAvatar.src = profile.avatar || "./assets/images/default-avatar.png";
    }

    if (profileName) {
        profileName.textContent = profile.displayName || "";
    }

    if (profileEmail) {
        profileEmail.textContent = profile.email || "";
    }

    if (profileDescription) {
        profileDescription.textContent = profile.biography || t("profile.noBiography");
    }

    // Cập nhật thông tin cá nhân
    if (profileGender) {
        profileGender.textContent = profile.gender || "";
    }

    if (profileBirth) {
        profileBirth.textContent = profile.birthday || "";
    }

    if (profileLink) {
        if (profile.socialLinks) {
            profileLink.href = profile.socialLinks;
            try {
                profileLink.textContent = new URL(profile.socialLinks).hostname;
            } catch (e) {
                profileLink.textContent = profile.socialLinks;
            }
        } else {
            profileLink.href = "#";
            profileLink.textContent = "Chưa có liên kết";
        }
    }

    // Cập nhật thông tin bổ sung
    if (profileStartedDay) {
        profileStartedDay.textContent = profile.createdAt ? convertToDate(profile.createdAt) : "";
    }

    if (profileFriendNum) {
        profileFriendNum.textContent = profile.countFriends?.toString() || "0";
    }

    if (profileDayNum) {
        // Tính số ngày từ ngày tạo tài khoản đến hiện tại
        if (profile.createdAt) {
            const createdDate = new Date(profile.createdAt);
            const currentDate = new Date();
            const diffTime = Math.abs(currentDate - createdDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            profileDayNum.textContent = diffDays.toString();
        } else {
            profileDayNum.textContent = "0";
        }
    }

    // Hiển thị nút chỉnh sửa chỉ khi đây là profile của người dùng hiện tại
    if (editProfileButton) {
        editProfileButton.style.display = profile.countFriendMutual === -1 ? "block" : "none";
    }
}
