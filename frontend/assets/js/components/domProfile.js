import { getProfileUser } from '../fetchers/infoFetcher.js';
import { getIconClassForUrl, convertToDate, dateToDMY, dateToYMD } from "../utils/renderData.js";
import { getListGender, getValueMappingGender } from "../config/i18n.js";
import { showAllPost } from "../utils/postProcessor.js";

let stateEdit = false; // Biến để theo dõi chế độ chỉnh sửa

window.loadProfile = async function () {
    const profile = await getMyProfile();
    await showMyProfile(profile);
}

// Bật tắt chế độ chỉnh sửa thông tin cá nhân
window.editProfileMode = async function () {
    if (stateEdit) {
        // Nếu đang ở chế độ chỉnh sửa, chuyển sang chế độ xem
        stateEdit = false;
    } else {
        // Nếu không, chuyển sang chế độ chỉnh sửa
        await editMode();
        stateEdit = true;
    }
}


async function editMode() {
    await changeTab("EditProfile");
}

// Lấy thông tin
async function getMyProfile() {
    const profile = await getProfileUser(localStorage.getItem("uid"));
    profile.countFriendMutual = -1; // Trường này không khả dụng với bản thân
    return profile;
}

async function showMyProfile(profile) {
    const profileContainer = document.getElementById('profileContainer');
    await showProfile(profile, profileContainer);
    const editProfileButton = profileContainer.querySelector(".edit-profile-button");
    editProfileButton.style.display = profile.countFriendMutual;

    const editProfileContainer = document.querySelector(".edit-profile-container");
    const socialLinkContainer = editProfileContainer.querySelector(".edit-profile-social-links");
    socialLinkContainer.innerHTML = ""; // Xóa tất cả các liên kết mạng xã hội hiện có
    setupProfileEditButtons(profile, editProfileContainer); // Chuẩn bị các dữ liệu cho edit
}

async function showProfile(profile, profileContainer) {
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

    //Xoá các liên kết sẵn có trong profileLink trước đó nếu có
    profileLink.innerHTML = "";

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
        if (socialLinks) {
            if (socialLinks.length === 0) {
            const noLinksMessage = document.createElement("p");
            noLinksMessage.textContent = t("profile.noSocialLinks");
            
            } else {
                socialLinks.forEach(link => {
                    const socialLinkItem = document.createElement("div");
                    socialLinkItem.className = "social-link-item";
                    const iconClass = getIconClassForUrl(link);

                    socialLinkItem.innerHTML = `
                        <i class="${iconClass}"></i>
                        <a href="${link}" target="_blank">${link}</a>
                    `;

                    profileLink.appendChild(socialLinkItem);
                });
            }
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

    const profileBodyImages = profileContainer.querySelector(".profile-body-images");
    const profileCountPosts = profileContainer.querySelector(".profile-count-posts");
    const uid = localStorage.getItem("uid");
    await showAllPost(profileBodyImages, profileCountPosts, uid);
}

// Handle profile edit button clicks
function setupProfileEditButtons(profile, editProfileContainer) {
    // Các trường thông tin cá nhân
    const avatar = editProfileContainer.querySelector(".profile-body-basic-info-avatar-edit-profile");
    avatar.src = profile.avatar || "./assets/images/default-avatar.png";

    const name = editProfileContainer.querySelector(".profile-name-input-edit-profile");
    name.placeholder = profile.displayName || t("profile.noName");

    const email = editProfileContainer.querySelector(".profile-email-input-edit-profile");
    email.placeholder = profile.email || t("profile.noEmail");

    const description = editProfileContainer.querySelector(".profile-description-input-edit-profile");
    description.placeholder = profile.biography || t("profile.noBiography");

    // Thêm các trường giới tính
    const selectGender = editProfileContainer.querySelector(".profile-gender-input-edit-profile");
    selectGender.innerHTML = "";
    const option = document.createElement("option");
    option.value = "";
    option.textContent = t("profile.gender-select");
    option.disabled = true;
    option.selected = true;
    selectGender.appendChild(option);

    const listGender = getListGender();
    listGender.forEach(gender => {
        const option = document.createElement("option");
        option.value = gender;
        option.textContent = gender;
        selectGender.appendChild(option);
    });

    const birth = editProfileContainer.querySelector(".profile-birth-input-edit-profile");
    birth.value = dateToYMD(new Date(profile.birthday)) || t("profile.noBirthday");
    birth.placeholder = birth.value || t("profile.noBirthday");

    // Các liên kết mạng xã hội
    const socialLinkContainer = editProfileContainer.querySelector(".edit-profile-social-links");
    const socialLinks = profile.socialLinks;
    if (socialLinks.length === 0) {
        socialLinkContainer.innerHTML = `<p>${t("profile.noSocialLinks")}</p>`;

    } else {
        socialLinks.forEach(link => {
            addLinkInListSocial(link, socialLinkContainer);
        });
    }
}

function addLinkInListSocial(link, socialLinkContainer) {
    const socialLinkItem = document.createElement("div");
    socialLinkItem.className = "social-link-item-edit-profile";
    const iconClass = getIconClassForUrl(link);

    const i = document.createElement("i");
    i.className = iconClass;
    socialLinkItem.appendChild(i);

    const a = document.createElement("a");
    a.href = link.toString();
    a.target = "_blank";
    a.textContent = link.toString();
    socialLinkItem.appendChild(a);

    const removeBtn = document.createElement("button");
    removeBtn.className = "remove-social-btn-edit-profile";
    removeBtn.textContent = "-";

    // dùng js để truyền biến đúng cách
    removeBtn.addEventListener("click", async () => {
        await removeLinkToListAndRequest(link, socialLinkContainer);
    });

    socialLinkItem.appendChild(removeBtn);
    socialLinkContainer.appendChild(socialLinkItem);
}

function removeLinkInListSocial(link, socialLinkContainer) {
    const socialLinkItem = socialLinkContainer.querySelector(`.social-link-item-edit-profile a[href="${link}"]`);
    if (socialLinkItem) {
        socialLinkItem.parentElement.remove();
    }
}

export {
    showProfile,
    addLinkInListSocial,
    removeLinkInListSocial,
}
