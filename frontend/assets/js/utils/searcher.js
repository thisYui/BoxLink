import { searchFriendByEmail, searchByName, getFriendProfile } from "../fetchers/request.js";
import { fixStatusFriend } from "./friendProcessor.js";
import { showProfile } from "../components/domProfile.js";


window.showListSearch = async function () {
    await removeListSearch(); // Xóa danh sách tìm kiếm cũ

    const inputValue = document.getElementById('searchInput').value;
    if (inputValue.trim() === "") {
        // Nếu không có giá trị tìm kiếm, không làm gì cả
        return;
    }

    const listSearch = await search(inputValue);

    const searchResult = document.querySelector(".search-results");
    listSearch.forEach(user => {
        addUserToListSearch(user, searchResult);
    });
}

window.chooseUserItem = async function (uid) {
    sessionStorage.setItem("searchUID", uid);

    await changeTab("FriendProfile");
    const profile = await getFriendProfile(uid);
    await showFriendProfile(profile);
}

async function showFriendProfile(profile) {
    const profileContainer = document.querySelector(".profile-friend-container");

    await showProfile(profile, profileContainer);

    const mutualCount = profileContainer.querySelector('.profile-mutual-friends')
    mutualCount.textContent = profile.countFriendMutual;

    fixStatusFriend(profile.status);
}

async function search(dataString) {
    // Kiểm tra xem có phải là email hay không
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailPattern.test(dataString)) {
        let listFriend = [];
        const user = await searchFriendByEmail(dataString);
        if (user && user.uid) {
            // Nếu tìm thấy người dùng, thêm vào danh sách
            listFriend.push(user);
        }

        return listFriend;

    } else {
        // Nếu không phải email, tìm kiếm theo tên
        return searchByName(dataString);
    }
}

function addUserToListSearch(user, searchResult) {
    if (user.uid === localStorage.getItem('uid')) {
        return;
    }

    const userItem = document.createElement('div');
    userItem.className = 'search-result-item';
    userItem.id = user.uid;

    userItem.addEventListener('click', async (event) => {
        const uid = event.currentTarget.id;
        await chooseUserItem(uid);
    });

    const avatar = document.createElement('img');
    avatar.src = user.avatar;
    avatar.classList.add('search-result-item-avatar');

    const content = document.createElement('div');
    content.classList.add('search-result-item-content');

    const name = document.createElement('h3');
    name.textContent = user.displayName;
    name.classList.add('search-result-item-content-name');

    const email = document.createElement('p');
    email.textContent = user.email;
    email.classList.add('search-result-item-content-email');

    content.appendChild(name);
    content.appendChild(email);

    userItem.appendChild(avatar);
    userItem.appendChild(content);

    searchResult.appendChild(userItem);
}

window.removeListSearch = async function () {
    const searchResult = document.querySelector(".search-results");
    while (searchResult.firstChild) {
        searchResult.removeChild(searchResult.firstChild);
    }
}
