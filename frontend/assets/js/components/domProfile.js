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
}