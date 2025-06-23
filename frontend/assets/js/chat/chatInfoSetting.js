import { formatRelativeTimeOnline } from "../utils/renderData.js";
import { addToListBoxNoNotice,removeFromListBoxNoNotice, isOnNotification } from "../user/notificationProcessor.js";
import { toggleNotification } from "../fetchers/chatFetcher.js"

window.openChatInfo = function () {
    const chatInfo = document.getElementById('chatInfoContainer');
    const isHidden = window.getComputedStyle(chatInfo).display === 'none';
    chatInfo.style.display = isHidden ? "block" : "none";
    transformDate();  // Cập nhật thông tin chat khi mở
}

window.clickNotice = async function(status) {
    const friendID = window.lastClickedUser;

    if (status === "on") {
        removeFromListBoxNoNotice(friendID);
    } else {
        addToListBoxNoNotice(friendID);
    }

    await toggleNotification();
}

function transformDate() {
    const friendID = window.lastClickedUser;

    // Find the chat box for this user
    const chatContainer = document.getElementById("chatContainer");
    const box = chatContainer.querySelector(`[id="${friendID}"]`);

    // Get user information from the box
    const name = box.querySelector('.chats-list-user-name').textContent;
    const avatar = box.querySelector('.chats-list-user-avatar').src;
    const stringTimeOnline = box.querySelector('.chats-list-user-content').dataset.date;
    const timeOnline = new Date(stringTimeOnline);

    // Update the chat info display with the user's information
    const chatInfo = document.getElementById('chatInfoContainer');
    const nameInfo = chatInfo.querySelector('.chats-info-header-name');
    const avatarInfo = chatInfo.querySelector('.chats-info-header-avatar');
    const activeInfo = chatInfo.querySelector('.chats-info-header-name-state');
    const noticeButton = chatInfo.querySelector('.chats-info-features-button-toggle-notice');
    const stateText = chatInfo.querySelector('.notification-state-text');
    const bellIcon = noticeButton.querySelector('.fa-solid');

    nameInfo.textContent = name;
    avatarInfo.src = avatar;
    activeInfo.textContent = formatRelativeTimeOnline(timeOnline);

    if (isOnNotification(friendID)) {
        bellIcon.classList.add('fa-bell');
        stateText.textContent = t("chat-info.turn-on-notifications");

    } else {
        bellIcon.classList.add('fa-bell-slash');
        stateText.textContent = t("chat-info.turn-on-notifications");
    }
}