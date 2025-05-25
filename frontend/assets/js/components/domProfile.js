import { getMyProfile, getProfileFriend, setAvatar, setDisplayName } from "../user/personalProfile.js";

window.loadProfile = function () {
    const profile = getMyProfile();
    showMyProfile(profile);
}

window.loadResultSearch = function () {
    const profile = getProfileFriend();
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

    // Tên, email, ảnh đại diện
    document.querySelector('.display-name').textContent = profile.displayName || '';
    document.querySelector('.email').textContent = profile.email || '';
    document.querySelector('.biography').textContent = profile.biography || '';
    document.querySelector('.profile-avatar').src = profile.avatar || 'assets/images/default-avatar.png';

    // Giới tính
    const genderDetail = document.querySelectorAll('.profile-detail')[0];
    if (genderDetail) {
        genderDetail.childNodes[1].textContent = ` ${profile.gender || ''}`;
    }

    // Ngày sinh
    const birthdayDetail = document.querySelectorAll('.profile-detail')[1];
    if (birthdayDetail) {
        birthdayDetail.childNodes[1].textContent = ` ${profile.birthday || ''}`;
    }

    // Mạng xã hội
    const socialDetail = document.querySelectorAll('.profile-detail')[2];
    if (socialDetail) {
        socialDetail.childNodes[1].innerHTML = ` ${profile.socialLinks || ''}`;
    }

    // Thống kê
    const stats = document.querySelectorAll('.profile-stats .stat-value');
    if (stats.length >= 3) {
        stats[0].textContent = profile.createdAt || '';
        stats[1].textContent = profile.countFriends?.toString() || '0';
        stats[2].textContent = profile.listFriend?.length?.toString() || '0';
    }

    // Mutual friends (ẩn nếu là trang cá nhân)
    const mutualCol = document.querySelector('.profile-stats .stat-column[hidden]');
    if (mutualCol) {
        if (profile.countFriendMutual === -1) {
            mutualCol.setAttribute('hidden', true);
        } else {
            mutualCol.removeAttribute('hidden');
            mutualCol.querySelector('.stat-value').textContent = profile.countFriendMutual.toString();
        }
    }

    // Cập nhật nút sửa
    const editBtn = document.querySelector('.edit-profile-btn');
    if (editBtn) {
        editBtn.textContent = 'Chỉnh sửa hồ sơ'; // hoặc giữ nguyên nếu dùng i18n
    }
}
