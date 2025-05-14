import { searchFriendByEmail } from '../fetchers/request.js';
import { changeAvatar, changeDisplayName, getProfileUser } from '../fetchers/infoFetcher.js';

// Lấy thông tin
async function getMyProfile() {
    const profile = await getProfileUser(localStorage.getItem("uid"));
    profile.countFriendMutual = -1; // Trường này không khả dụng với bản thân
    return profile;
}


async function getProfileFriend(email) {
    const { uid } = await searchFriendByEmail(email);
    const profile = await getProfileUser(uid);

    // Tìm số bạn chung
    let countFriendMutual = 0;
    profile.friendList.forEach(friend => {
        if (friend in window.listChatBoxID) {
            countFriendMutual++;
        }
    });

    profile.countFriendMutual= countFriendMutual;
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
    getProfileFriend,
    setAvatar,
    setDisplayName,
}

