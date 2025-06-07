import { changeAvatar, changeBiography, changeBirthday,
        changePassword, changeGender, changeDisplayName,
        operaSocialLink, deleteAccount, updateOnlineTime
} from '../fetchers/infoFetcher.js';

window.sendTimeOnline = async function () {
    // Gửi thời gian online của người dùng
    const response = await updateOnlineTime();
    if (!response.ok) {
        console.error("Failed to update online time");
    }
}

// thay đổi mật khẩu
async function setPassword() {

}

// Thay đổi ảnh đại diện
async function setAvatar(avatar) {

}

// Thay đổi tên hiển thị
async function setDisplayName(displayName) {

}

// Thay đổi ngày sinh
async function setBirthday(birthday) {

}

// Thay đổi giới tính
async function setGender(gender) {

}

// Thay đổi mô tả cá nhân
async function setBiography(biography) {

}

// Thêm đường liên kết mạng xã hội
async function addSocialLink(socialLink) {
    // socialLink là một đối tượng chứa thông tin về mạng xã hội
    // Ví dụ: { platform: 'Facebook', url: 'https://facebook.com/username' }
}

// Xóa đường liên kết mạng xã hội
async function removeSocialLink(socialLink) {
    // socialLinkId là ID của đường liên kết mạng xã hội cần xóa
}
