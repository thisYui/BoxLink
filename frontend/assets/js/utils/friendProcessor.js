import { friend } from "../fetchers/infoFetcher.js";

window.addFriend = async function() {
    // Gửi lời mời kết bạn
    await friend(localStorage.getItem("uid"), sessionStorage.getItem("searchUID"), "friend-request");
    // Đưa về friend-request
    fixStatusFriend('friend-request');
}

window.acceptFriend = async function() {
    // Đồng ý kết bạn
    await friend(localStorage.getItem("uid"), sessionStorage.getItem("searchUID"), "accept-friend");

    // Đưa về bạn bè
    fixStatusFriend('friend');
}

window.declineFriend = async function() {
    // Từ chối kết bạn
    await friend(localStorage.getItem("uid"), sessionStorage.getItem("searchUID"), "cancel-friend");

    // Đưa về none
    fixStatusFriend('none');
}

window.removeFriend = async function() {
    // Xóa bạn bè
    await friend(localStorage.getItem("uid"), sessionStorage.getItem("searchUID"), "unfriend");

    // Đưa về none
    fixStatusFriend('none');
}

window.recallFriend = async function() {
    // Thu hồi lời mời kết bạn
    await friend(localStorage.getItem("uid"), sessionStorage.getItem("searchUID"), "recall-friend");

    // Đưa về none
    fixStatusFriend('none');
}

function fixStatusFriend(status) {
    // Ẩn toàn bộ
    const profileContainer = document.querySelector(".profile-friend-container");
    const friendActionButtons = profileContainer.querySelectorAll(".friend-action-button");
    friendActionButtons.forEach(button => {
        button.classList.add("hidden");
    });

    // Kiểm tra tình trạng kết bạn
    if (status === "friend-request") {
        // Đã gửi lời mời kết bạn
        const sendButton = profileContainer.querySelector(".request-sent");
        const recallButton = profileContainer.querySelector(".recall-request");
        sendButton.classList.remove("hidden");
        recallButton.classList.remove("hidden");

    } else if (status === "receiver-request") {
        // Đã nhận lời mời kết bạn
        const acceptButton = profileContainer.querySelector(".accept-request");
        const declineButton = profileContainer.querySelector(".decline-request");
        acceptButton.classList.remove("hidden");
        declineButton.classList.remove("hidden");

    } else if (status === "friend") {
        // Đã là bạn bè
        const friendButton = profileContainer.querySelector(".friend");
        const removeButton = profileContainer.querySelector(".remove-friend");
        friendButton.classList.remove("hidden");
        removeButton.classList.remove("hidden");

    } else {
        // Chưa kết bạn
        const addButton = profileContainer.querySelector(".add-friend");
        addButton.classList.remove("hidden");
    }
}

export {
    fixStatusFriend,
}
