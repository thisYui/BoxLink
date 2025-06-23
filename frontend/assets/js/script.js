window.lastClickedUser = sessionStorage.getItem("lastClickedUser") || null;
window.listChatBoxID = {}
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

window.openChatInfo = function () {
    const chatInfor = document.getElementById('chatInfoContainer');
    const isHidden = window.getComputedStyle(chatInfor).display === 'none';
    chatInfor.style.display = isHidden ? "block" : "none";
}

window.logOut = function () {
    // Xóa sessionStorage
    sessionStorage.clear();

    // Xóa uid
    localStorage.removeItem('uid');

    // Chuyển hướng về trang đăng nhập
    window.location.href = '/auth.html';
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


document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("modalImg");
    const closeBtn = document.getElementById("closeModal");
    const imageDotsContainer = document.getElementById("imageDots");

    // Nút chuyển bài đăng
    const prevPostBtn = document.getElementById("prevPostBtn");
    const nextPostBtn = document.getElementById("nextPostBtn");

    // Nút chuyển ảnh trong bài đăng
    const prevImageBtn = document.getElementById("prevImageBtn");
    const nextImageBtn = document.getElementById("nextImageBtn");

    const allPosts = document.querySelectorAll(".profile-body-images-content");

    let currentPosts = [];      // danh sách bài đăng hiện tại trong 1 profile
    let postIndex = 0;        // bài đăng hiện tại
    let currentGroup = [];    // ảnh trong bài
    let currentIndex = 0;     // ảnh trong nhóm

    allPosts.forEach(container => {
        const imgs = container.querySelectorAll("img");
        imgs.forEach((img, index) => {
            img.style.display = index === 0 ? "block" : "none";
        });
    });

    allPosts.forEach((container, i) => {
        const firstImg = container.querySelector("img");
        firstImg.addEventListener("click", () => {
            const profileContainer = container.closest('.profile-container, .profile-friend-container');
            if (!profileContainer) return;
            console.log("Profile container found:", profileContainer);
            currentPosts = Array.from(profileContainer.querySelectorAll(".profile-body-images-content"));

            postIndex = currentPosts.indexOf(container);
            openModalForPost(postIndex);
        });
    });

    function openModalForPost(index) {
        const post = currentPosts[index];
        currentGroup = Array.from(post.querySelectorAll("img"));
        currentIndex = 0;
        modal.style.display = "flex";

        if (currentGroup.length > 1) { 
            createDots();
        }
        updateModalImage();
        updateArrowVisibility();
    }

    
    function updateModalImage() {
        modalImg.src = currentGroup[currentIndex].src;
        updateArrowVisibility();
        updateDots(); 
    }
    
    function updateDots() {
        const dots = imageDotsContainer.querySelectorAll(".dot");
        dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === currentIndex);
        });
    }

    function createDots() {
        imageDotsContainer.innerHTML = "";
        currentGroup.forEach((_, i) => {
            const dot = document.createElement("div");
            dot.classList.add("dot");
            if (i === currentIndex) dot.classList.add("active");

            dot.addEventListener("click", () => {
                currentIndex = i;
                updateModalImage();
            });

            imageDotsContainer.appendChild(dot);
        });
    }

    function updateArrowVisibility() {
        prevImageBtn.style.visibility = currentIndex === 0 ? "hidden" : "visible";
        nextImageBtn.style.visibility = currentIndex === currentGroup.length - 1 ? "hidden" : "visible";

        prevPostBtn.style.visibility = postIndex === 0 ? "hidden" : "visible";
        nextPostBtn.style.visibility = postIndex === currentPosts.length - 1 ? "hidden" : "visible";
    }


    function closeModal() {
        modal.style.display = "none";
        modalImg.src = "";
    }

    prevImageBtn.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateModalImage();
        }
    });

    nextImageBtn.addEventListener("click", () => {
        if (currentIndex < currentGroup.length - 1) {
            currentIndex++;
            updateModalImage();
        }
    });

    prevPostBtn.addEventListener("click", () => {
        if (postIndex > 0) {
            postIndex--;
            openModalForPost(postIndex);
        }
    });

    nextPostBtn.addEventListener("click", () => {
        if (postIndex < currentPosts.length - 1) {
            postIndex++;
            openModalForPost(postIndex);
        }
    });


    // Đóng modal
    closeBtn.addEventListener("click", closeModal);
    modal.addEventListener("click", e => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener("keydown", e => {
        if (modal.style.display === "flex") {
            if (e.key === "ArrowRight") nextImageBtn.click();
            else if (e.key === "ArrowLeft") prevImageBtn.click();
            else if (e.key === "Escape") closeModal();
        }
    });
});
