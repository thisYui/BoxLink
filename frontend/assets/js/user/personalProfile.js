import { changeAvatar, changeDisplayName, getProfileUser } from '../fetchers/infoFetcher.js';

// Lấy thông tin
async function getMyProfile() {
    const profile = await getProfileUser(localStorage.getItem("uid"));
    profile.countFriendMutual = -1; // Trường này không khả dụng với bản thân
    return profile;
}


// Thay đổi ảnh đại diện
function setAvatar() {

}

// Thay đổi tên hiển thị
function setDisplayName() {

}

export {
    getMyProfile,
    setAvatar,
    setDisplayName,
}

