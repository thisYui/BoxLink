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
async function changePassword() {

}

// Thay đổi ảnh đại diện
async function changeAvatar(avatar) {

}

// Thay đổi tên hiển thị
async function changeDisplayName(displayName) {

}

// Thay đổi ngày sinh
async function changeBirthday(birthday) {

}

// Thay đổi giới tính
async function changeGender(gender) {

}

// Thay đổi mô tả cá nhân
async function changeBiography(biography) {

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
