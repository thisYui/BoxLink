// Đăng ký sự kiện click cho tất cả phần tử có class là "item"
document.addEventListener("DOMContentLoaded", () => {
    // Lấy dữ liệu cho settings
    loadSettings().then();

    // Lấy dữ liệu từ database
    loadPage().then();

    // Cập nhật thời gian online mỗi phút
    setInterval(() => {
        sendTimeOnline().catch(console.error);
    }, 60 * 1000);

    // Lấy trạng thái online của người dùng mỗi 2 phút
    setInterval(() => {
        updateLastOnlineListFriend().catch(console.error);
    }, 2 * 60 * 1000);

    // duy trì trạng thái session
    setInterval(() => {
        keepSession().catch(console.error);
    }, 10 * 60 * 1000); // 10 phút

    document.getElementById("chatContainer").addEventListener("click", (event) => {
        const element = event.target.closest(".chats-list-user");

        // Kiểm tra nếu click vào phần tử có class chat-box-area-box
        if (element) {
            handleUserClick(element);
        }
    })

    document.getElementById("openChatInfoButton").addEventListener("click", () => {
        loadChatInfo().then();
    })

    // Xóa nội dung ô tìm kiếm khi nhấn nút xóa
    document.getElementById('clearButton').addEventListener('click', async () => {
        const input = document.getElementById('searchInput');
        input.value = '';
        input.focus();
        await removeListSearch(); // Xóa danh sách tìm kiếm cũ
    });

    // Gắn sự kiện
    // Gọi hàm showListSearch khi người dùng nhập vào ô tìm kiếm
    // Trong 500ms nếu không có sự kiện mới, hàm sẽ được gọi
    const debouncedSearch = debounce(showListSearch, 500);
    document.getElementById("searchInput").addEventListener("input", debouncedSearch);

    // Gửi khi ấn vào máy bay giấy
    document.getElementById("send-button").addEventListener("click", async (event) => {
        event.preventDefault();
        await sendMessage('text');
    });

    // Gửi khi ấn phím Enter
    document.getElementById("message-input").addEventListener("keydown", async (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            await sendMessage('text');
        }
    });

    // Gửi file khi ấn vào nút open
    document.getElementById("attachment").addEventListener("change", async () => {
        await sendMessage('file');
    });

    document.getElementById('bellIcon').addEventListener('click', () => {
        const checkbox = document.getElementById('notifyToggle');
        const bellIcon = document.getElementById('bellIcon');
        const stateText = document.getElementById('notification-state-text');

        // Toggle trạng thái checkbox
        checkbox.checked = !checkbox.checked;

        // Cập nhật icon và nội dung trạng thái
        if (checkbox.checked) {
            bellIcon.classList.remove('fa-bell-slash');
            bellIcon.classList.add('fa-bell');
            stateText.textContent = t("chat_info.turn_on_notifications");
        } else {
            bellIcon.classList.remove('fa-bell');
            bellIcon.classList.add('fa-bell-slash');
            stateText.textContent = t("chat_info.turn_off_notifications");
        }
    });

    // Khi click vào nút reply
    document.getElementById("messageContainer").addEventListener("click", (event) => {
        const replyButton = event.target.closest(".reply-button");
        if (!replyButton) return;

        const messageID = replyButton.id;
        sessionStorage.setItem("replyMessageID", messageID);

        // Lấy thông tin của tin nhắn để reply
        loadMessageRelyTo(messageID);
    });

     // Close reply
    document.getElementById('closeReplyTo').addEventListener('click', () => {
        const replyMessageContainer = document.getElementById('replyMessageContainer');
        replyMessageContainer.classList.add("hidden");
        sessionStorage.setItem("replyMessageID", "");
    });

    // Thêm liên kết đến
    document.getElementById("addLinkButton").addEventListener("click",  () => {
        const socialLinkInput = document.getElementById("addLinkInputGroup");
        socialLinkInput.classList.remove("hidden");

        const addLink = document.getElementById("addLinkButton");
        addLink.classList.add("hidden");
    });

    // Thêm 1 liên kết mạng xã hội
    document.getElementById("acceptAddLinkButton").addEventListener("click", async () => {
        const socialLinkInput = document.getElementById("newSocialLink");
        const value = socialLinkInput.value;
        const socialLinkContainer = document.querySelector(".profile-body-personal-info-container-edit-profile");
        await addLinkToListAndRequest(value, socialLinkContainer);
    });

    // Không thêm nữa
    document.getElementById("cancelAddLinkButton").addEventListener("click", () => {
        const socialLinkInput = document.getElementById("addLinkInputGroup");
        socialLinkInput.classList.add("hidden");

        const addLink = document.getElementById("addLinkButton");
        addLink.classList.remove("hidden");
    });
});

function debounce(fn, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    };
}

window.logOut = function () {
    // logout session
    logoutSession().then();

    // Xóa sessionStorage
    sessionStorage.clear();

    // Xóa uid
    localStorage.removeItem('uid');

    // Chuyển hướng về trang đăng nhập
    window.location.href = '/auth.html';
}

window.closeListUser = function () {
    const popup = document.getElementById('listUser');
    popup.classList.remove('active'); // ẩn modal danh sách người dùng

    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.classList.add('hidden'); // ẩn overlay nếu dùng chung
        overlay.onclick = null; // xoá sự kiện đóng nếu đã gán trước đó
    }
}

window.showListUserPopup = function (listUser, title) {
    // element {
    //      id, displayName, avatar, relationship
    // }
    // relationship: owner, friend, request, receive, none

    const relationships = t("profile.relationship");

    const colorButton = {
        owner: "grey",
        friend: "grey",
        request: "grey",
        received: "blue",
        none: "blue"
    }

    // set tiêu đề popup
    document.getElementById('popupTitle').textContent = title;

    // lấy container danh sách và xoá nội dung cũ
    const container = document.getElementById('popupUserList');
    container.innerHTML = '';

    // render từng người dùng
    listUser.forEach(user => {
        const div = document.createElement('div');
        div.id = user.id; // set id cho div để có thể lấy ra sau này
        div.className = 'user-item';

        div.innerHTML = `
            <div class="user-info">
                <img src="${user.avatar}" alt="">
                <div class="user-text">
                      <div class="username">${user.displayName}</div>
                </div>
            </div>
            <button class="follow-btn">
                ${relationships[user.relationship]}
            </button>
        `;

        // thêm vào danh sách
        container.appendChild(div);

        // xử lý click nút Follow/Following (nếu muốn)
        const followBtn = div.querySelector('.follow-btn');

        // Thay màu nền theo mối quan hệ
        followBtn.style.backgroundColor = colorButton[user.relationship];

        followBtn.addEventListener('click', async () => {
            const userId = div.id; // lấy id của người dùng từ div
            let newRelationship;

            if (user.relationship === 'none') {
                await window.toggleStatusFriend(userId, 'send'); // gửi lời mời kết bạn
                newRelationship = "request";

            } else if (user.relationship === 'request') {
                // Nếu là "Đã gửi lời mời", thu hồi lời mời kết bạn
                await window.toggleStatusFriend(userId, 'recall');
                newRelationship = "none";

            } else if (user.relationship === 'received') {
                // Nếu là "Xác nhận", xác nhận lời mời kết bạn
                await window.toggleStatusFriend(userId, 'accept');
                newRelationship = "friend";

            } else if (user.relationship === 'friend') {
                // Nếu là "Bạn bè", xoá kết bạn
                await window.toggleStatusFriend(userId, 'remove');
                newRelationship = "none";
            }

            followBtn.style.backgroundColor = colorButton[newRelationship]; // đổi màu nút
            followBtn.textContent = relationships[newRelationship]; // cập nhật văn bản nút
        });
    });

    // hiển thị popup
    document.getElementById('listUser').classList.add('active');

    // hiển thị overlay
    const overlay = document.getElementById('overlay');
    if (overlay) {
        overlay.classList.remove('hidden');
        overlay.onclick = closeListUser;
    }
}

// Manage tab switching functionality
window.changeTab = async function (tabName) {
    document.getElementById('chatInfoContainer').style.display = 'none';

    const containers = {
        chatContainer: document.getElementById('chatContainer'),
        messageGroupContainer: document.getElementById('messageGroupContainer'),
        profileContainer: document.getElementById('profileContainer'),
        profileEditContainer: document.getElementById('profileEditContainer'),
        settingsContainer: document.getElementById('settingsContainer'),
        searchContainer: document.getElementById('searchContainer'),
        notificationContainer: document.getElementById('notificationContainer'),
        friendProfileContainer: document.getElementById('friendProfileContainer'),
        postContainer: document.getElementById('postContainer'),
    };

    const menuButtons = document.querySelectorAll('.menu-bar-button');

    if (tabName === "Search") {
        containers.chatContainer.classList.add('hidden');  // Ẩn đoạn chatContainer nếu nó đang hiển thị
        containers.notificationContainer.classList.add('hidden');  // Ẩn notificationContainer nếu nó đang hiển thị

        if (containers.searchContainer.classList.contains('hidden')) {
            containers.searchContainer.classList.remove('hidden');
        } else {
            containers.searchContainer.classList.add('hidden')
        }

        return;
    } else if (tabName === "Notification") {
        containers.chatContainer.classList.add('hidden');  // Ẩn đoạn chatContainer nếu nó đang hiển thị
        containers.searchContainer.classList.add('hidden');  // Ẩn searchContainer nếu nó đang hiển thị

        if (containers.notificationContainer.classList.contains('hidden')) {
            containers.notificationContainer.classList.remove('hidden');
            resetNumberNotification();  // Reset số lượng thông báo chưa đọc
        } else {
            containers.notificationContainer.classList.add('hidden')
        }

        return;
    } else if (tabName === 'ChatList' && !containers.messageGroupContainer.classList.contains('hidden')) {
        containers.searchContainer.classList.add('hidden');  // Ẩn đoạn chatContainer nếu nó đang hiển thị
        containers.notificationContainer.classList.add('hidden');  // Ẩn notificationContainer nếu nó đang hiển thị

        if (containers.chatContainer.classList.contains('hidden')) {
            containers.chatContainer.classList.remove('hidden');
        } else {
            containers.chatContainer.classList.add('hidden');
        }
        return;
    }

    // Ẩn tất cả container trước
    for (const key in containers) {
        containers[key].classList.add('hidden');
    }

    // Bỏ chọn tất cả nút menu
    menuButtons.forEach(btn => btn.classList.remove('menu-bar-button-choosen'));

    // Định nghĩa map tab -> containerId và buttonId
    const tabMap = {
        Home: {
            show: ['chatContainer', 'messageGroupContainer'],
            buttonId: 'Home'
        },
        Profile: {
            show: ['profileContainer'],
            buttonId: 'Profile',
            onShow: loadProfile,
        },
        EditProfile: {
            show: ['profileEditContainer'],
            buttonId: 'Profile',
        },
        Settings: {
            show: ['settingsContainer'],
            buttonId: 'Settings'
        },
        FriendProfile: {
            show: ['friendProfileContainer'],
        },
        Post: {
            show: ['postContainer'],
            buttonId: 'Post'
        }
    };

    if (tabMap[tabName]) {
        tabMap[tabName].show.forEach(id => containers[id].classList.remove('hidden'));

        if (tabMap[tabName].buttonId) {
            document.getElementById(tabMap[tabName].buttonId).classList.add('menu-bar-button-choosen');
        }

        if (tabMap[tabName].onShow) {
            await tabMap[tabName].onShow();
        }
    }
};
