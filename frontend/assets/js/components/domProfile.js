import { getMyProfile } from "../user/personalProfile.js";
import { convertToDate, dateToDMY } from "../utils/renderData.js";
import { getListGender, getValueMappingGender } from "../config/i18n.js";
import { fixStatusFriend } from "../utils/friendProcessor.js";

let stateEdit = false; // Biến để theo dõi chế độ chỉnh sửa

window.loadProfile = async function () {
    const profile = await getMyProfile();
    showMyProfile(profile);
}

// Bật tắt chế độ chỉnh sửa thông tin cá nhân
window.editProfileMode = function () {
    if (stateEdit) {
        // Nếu đang ở chế độ chỉnh sửa, chuyển sang chế độ xem
        viewMode();
        stateEdit = false;
    } else {
        // Nếu không, chuyển sang chế độ chỉnh sửa
        editMode();
        stateEdit = true;
    }
}


function editMode() {
    // Email không thể chỉnh sửa, chỉ có thể xem

    // Làm mờ các trường dữ liệu trên cho thấy có thể bị chỉnh sửa

}

function viewMode() {
    // Lưu lại các thay đổi
    // Chuyển trang hiện tại thành dạng không thể chỉnh sửa
}

function showMyProfile(profile) {
    const profileContainer = document.querySelector(".profile-container");

    showProfile(profile, profileContainer);

    const editProfileButton = profileContainer.querySelector(".edit-profile-button");
    editProfileButton.style.display = profile.countFriendMutual;

}

function showProfile(profile, profileContainer) {
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
    const profileAvatar = profileContainer.querySelector(".profile-body-basic-info-avatar");
    const profileName = profileContainer.querySelector(".profile-name");
    const profileEmail = profileContainer.querySelector(".profile-email");
    const profileDescription = profileContainer.querySelector(".profile-description");

    // Cập nhật thông tin cá nhân
    const profileGender = profileContainer.querySelector(".profile-gender");
    const profileBirth = profileContainer.querySelector(".profile-birth");
    const profileLink = profileContainer.querySelector(".profile-link");

    // Cập nhật thông tin bổ sung
    const profileStartedDay = profileContainer.querySelector(".profile-started-day");
    const profileFriendNum = profileContainer.querySelector(".profile-friend-num");

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
        profileGender.textContent = getValueMappingGender(profile.gender);
    }

    if (profileBirth) {
        // Ngày sinh có kiểu Date chuyển thành string
        profileBirth.textContent = dateToDMY(new Date(profile.birthday)) || t("profile.noBirthday");
    }

    if (profileLink) {
        const socialLinks = profile.socialLinks;

        if (Object.keys(socialLinks).length !== 0) {
            for (const typeLink in socialLinks) {
                const link = socialLinks[typeLink];

                if (link) {
                    // Tạo liên kết cho mỗi loại mạng xã hội
                    const a = document.createElement("a");
                    a.href = link;
                    a.textContent = typeLink.charAt(0).toUpperCase() + typeLink.slice(1);
                    a.target = "_blank"; // Mở liên kết trong tab mới
                    profileLink.appendChild(a);
                    profileLink.appendChild(document.createElement("br")); // Thêm dòng mới sau mỗi liên kết
                }
            }
        } else {
            profileLink.href = "#";
            profileLink.textContent = "Chưa có liên kết";
        }
    }

    // Cập nhật thông tin bổ sung
    if (profileStartedDay) {
        const date = convertToDate(profile.createdAt);
        profileStartedDay.textContent = dateToDMY(date);
    }

    if (profileFriendNum) {
        profileFriendNum.textContent = profile.countFriends?.toString() || "0";
    }
}

export {
    showProfile
}
