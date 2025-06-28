import {
    changeAvatar, changeBiography, changeBirthday,
    changePassword, changeGender, changeDisplayName,
    changeEmail, operaSocialLink, deleteAccount,
    updateOnlineTime } from '../fetchers/infoFetcher.js';
import { addLinkInListSocial, removeLinkInListSocial } from "../components/domProfile.js";
import { getInterGender } from "../config/i18n.js";

// Danh sách các hàm thay đổi sẽ đc gọi trong hàng đợi
const functionQueue = [];

window.sendTimeOnline = async function () {
    // Gửi thời gian online của người dùng
    const response = await updateOnlineTime();
    if (!response.ok) {
        console.error("Failed to update online time");
    }
}

window.saveProfileChanges = async function (){
    recordChange();  // Ghi nhận các thay đổi từ các trường input

    if (functionQueue.length === 0) {
        return;
    }

    for (const func of functionQueue) {
        console.log(func);  // Gọi từng hàm trong hàng đợi
    }

    for (const func of functionQueue) {
        await func();  // Gọi từng hàm trong hàng đợi
    }

    functionQueue.length = 0; // Xóa hàng đợi sau khi đã thực hiện tất cả các hàm
    await changeTab("Profile");
}

// Thêm đường liên kết mạng xã hội
async function addSocialLink(socialLink) {
    // socialLink là một đối tượng chứa thông tin về mạng xã hội
    await operaSocialLink('add-social-link', socialLink);
}

// Xóa đường liên kết mạng xã hội
async function removeSocialLink(socialLink) {
    // socialLinkId là ID của đường liên kết mạng xã hội cần xóa
    await operaSocialLink('remove-social-link', socialLink);
}

function addFunctionToQueue(func) {
    // Thêm hàm vào hàng đợi
    functionQueue.push(func);
}

// Ghi nhận sự thay đổi từ các trường input còn lại
function recordChange() {
    // Kiểm tra tên
    const displayNameInput = document.querySelector(".profile-name-input-edit-profile");
    if (displayNameInput.value.trim() !== displayNameInput.placeholder && displayNameInput.value.trim() !== "") {
        addFunctionToQueue(() => changeDisplayName(displayNameInput.value));
    }

    // Kiểm tra email
    const emailInput = document.querySelector(".profile-email-input-edit-profile");
    if (emailInput.value.trim() !== emailInput.placeholder && emailInput.value.trim() !== "") {
        addFunctionToQueue(() => changeEmail(emailInput.value));
    }

    // Kiểm tra mô tả
    const descriptionInput = document.querySelector(".profile-description-input-edit-profile");
    if (descriptionInput.value.trim() !== descriptionInput.placeholder && descriptionInput.value.trim() !== "") {
        addFunctionToQueue(() => changeBiography(descriptionInput.value));
    }

    // Kiểm tra giới tính
    const selectGender = document.querySelector(".profile-gender-input-edit-profile");
    if (selectGender.value !== selectGender.placeholder && selectGender.value !== "") {
        addFunctionToQueue(() => changeGender(getInterGender(selectGender.value)));
    }

    // Kiểm tra ngày sinh
    const birthInput = document.querySelector(".profile-birth-input-edit-profile");
    if (birthInput.value !== birthInput.placeholder && birthInput.value.trim() !== "") {
        addFunctionToQueue(() => changeBirthday(new Date(birthInput.value)));
    }
}

window.addLinkToListAndRequest = async function (link, socialLinkContainer) {
    addLinkInListSocial(link, socialLinkContainer);
    addFunctionToQueue(() => addSocialLink(link));
}

window.removeLinkToListAndRequest = async function (link, socialLinkContainer) {
    removeLinkInListSocial(link, socialLinkContainer);
    addFunctionToQueue(() => removeSocialLink(link));
}

window.handleAvatarChange = function () {
    const input = document.getElementById('avatarInput');
    if (!input.files || !input.files[0]) return;

    const file = input.files[0]; // chính là dữ liệu ảnh

    // Thay đổi ảnh hiển thị
    const img = document.querySelector(".profile-body-basic-info-avatar-edit-profile");
    img.src = URL.createObjectURL(file);

    addFunctionToQueue(() => changeAvatar(file));
}


window.resetPassword = async function () {
    const newPassword = document.querySelector(".input-new-password").value
    const confirmNewPassword = document.querySelector(".confirm-new-password").value;

    if (newPassword !== confirmNewPassword) {
        alert(t("settings.passwords-not-match"));
        return;
    }

    try {
        await changePassword(newPassword);
        alert(t("settings.password-changed-successfully"));
        openModal('closeModal'); // Đóng modal sau khi thay đổi thành công

    } catch (error) {
        alert(t("settings.error-changing-password"));
    }
}

window.deleteAccount = async function () {
    try {
        await deleteAccount();
        alert(t("settings.account-deleted-successfully"));
        window.logOut();

    } catch (error) {
        alert(t("settings.error-deleting-account"));
    }
}
