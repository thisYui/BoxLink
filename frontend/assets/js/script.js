import { loadLanguage, getUserLanguage } from "./config/i18n.js";

window.lastClickedUser = sessionStorage.getItem("lastClickedUser") || null;
window.listChatBoxID = {}

// Đăng ký sự kiện click cho tất cả phần tử có class là "item"
document.addEventListener("DOMContentLoaded", () => {
    // Lấy ngôn ngữ dựa trên cài đặt của người dùng
    loadLanguage(getUserLanguage()).then();

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

    document.getElementById("openChatInfoButton").addEventListener("click", (event) => {
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

    document.getElementById('turn-off-notification-button').addEventListener('click', () => {
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

    // Set up event listeners for the profile edit buttons
    setupProfileEditButtons();

    // Set up theme toggle functionality
    setupThemeToggle();

    // Set up modal closers
    setupModalClosers();

    // Set up form submission handling
    setupEditFormSubmission();

    // Load saved theme
    loadSavedTheme();

    // Handle the main logout button
    document.getElementById('logOutButton').addEventListener('click', function() {
        window.location.href = 'auth.html';
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

// Manage tab switching functionality
window.changeTab = async function (tabName) {
    document.getElementById('chatInfoContainer').style.display = 'none';

    const containers = {
        chatContainer: document.getElementById('chatContainer'),
        messageGroupContainer: document.getElementById('messageGroupContainer'),
        profileContainer: document.getElementById('profileContainer'),
        settingsContainer: document.getElementById('settingsContainer'),
        searchContainer: document.getElementById('searchContainer'),
        notificationContainer: document.getElementById('notificationContainer'),
        friendProfileContainer: document.getElementById('friendProfileContainer'),
    };

    const menuButtons = document.querySelectorAll('.menu-bar-button');

    if (tabName === "Search") {
        containers.chatContainer.classList.add('hidden');  // Ẩn đoạn chatContainer nếu nó đang hiển thị
        if (containers.searchContainer.classList.contains('hidden')) {
            containers.searchContainer.classList.remove('hidden');
        } else {
            containers.searchContainer.classList.add('hidden')
        }
        return;
    }

    // Toggle FriendList riêng
    if (tabName === 'ChatList' && !containers.messageGroupContainer.classList.contains('hidden')) {
        containers.searchContainer.classList.add('hidden');  // Ẩn đoạn chatContainer nếu nó đang hiển thị
        if (containers.chatContainer.classList.contains('hidden')) {
            containers.chatContainer.classList.remove('hidden');
        } else {
            containers.chatContainer.classList.add('hidden');
        }
        return;
    } else if (tabName === 'ChatList') {
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
        Settings: {
            show: ['settingsContainer'],
            buttonId: 'Settings'
        },
        Notification: {
            show: ['notificationContainer'],
            buttonId: 'Notification'
        },
        FriendProfile: {
            show: ['friendProfileContainer'],
        },
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

// Show/hide dropdown boxes like logout menu
window.showBox = function (boxId, triggerId) {
    const box = document.getElementById(boxId);
    const isVisible = !box.classList.contains('hidden');

    // Hide all other dropdown boxes first
    const allDropdowns = document.querySelectorAll('.logOutBox-button');
    allDropdowns.forEach(dropdown => {
        dropdown.classList.add('hidden');
    });

    // Toggle visibility of the selected box
    if (isVisible) {
        box.classList.add('hidden');
    } else {
        box.classList.remove('hidden');

        // Position the box relative to trigger element
        const trigger = document.getElementById(triggerId);
        if (trigger && box) {
            const triggerRect = trigger.getBoundingClientRect();
            box.style.top = (triggerRect.bottom + 5) + 'px';
            box.style.left = triggerRect.left + 'px';
        }

        // Close the box when clicking outside
        document.addEventListener('click', function closeDropdown(e) {
            if (!box.contains(e.target) && e.target.id !== triggerId) {
                box.classList.add('hidden');
                document.removeEventListener('click', closeDropdown);
            }
        });
    }
}

/**CHÚ Ý:
 * Các hàm sau đây chưa đc kiểm chứng
 */


// Handle profile edit button clicks
window.setupProfileEditButtons = function () {
    const editButtons = document.querySelectorAll('.edit-btn:not(.disabled)');

    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const infoItem = this.closest('.profile-info-item');
            const label = infoItem.querySelector('label').textContent;
            const value = infoItem.querySelector('.profile-info-value span').textContent;
            const fieldId = infoItem.querySelector('.profile-info-value span').id;

            // Set modal title based on the field being edited
            document.getElementById('modalTitle').textContent = 'Edit ' + label;

            // Show/hide appropriate input fields based on what's being edited
            const editInput = document.getElementById('editInput');
            const genderGroup = document.getElementById('genderSelectGroup');
            const dobGroup = document.getElementById('dobInputGroup');

            // Reset all input groups
            editInput.style.display = 'block';
            genderGroup.style.display = 'none';
            dobGroup.style.display = 'none';

            // Configure specific fields
            if (fieldId === 'profileGender') {
                editInput.style.display = 'none';
                genderGroup.style.display = 'block';
                document.getElementById('genderSelect').value = value;
            } else if (fieldId === 'profileDob') {
                editInput.style.display = 'none';
                dobGroup.style.display = 'block';
                // Convert the date format for date input (assuming DD/MM/YYYY to YYYY-MM-DD)
                const dateParts = value.split('/');
                if (dateParts.length === 3) {
                    const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
                    document.getElementById('dobInput').value = formattedDate;
                }
            } else {
                editInput.value = value;
            }

            // Store the field ID to know which field to update on save
            document.getElementById('editForm').dataset.fieldId = fieldId;

            // Show modal and overlay
            document.getElementById('editModal').classList.add('active');
            document.getElementById('overlay').classList.add('active');
        });
    });
}

// Handle theme toggle in settings
window.setupThemeToggle = function () {
    const themeToggle = document.getElementById('themeToggle');

    themeToggle.addEventListener('click', function() {
        // Show theme selection modal
        document.getElementById('themeModal').classList.add('active');
        document.getElementById('overlay').classList.add('active');
    });

    // Set up theme option selection
    const themeOptions = document.querySelectorAll('.theme-option');
    themeOptions.forEach(option => {
        option.addEventListener('click', function() {
            const selectedTheme = this.dataset.theme;
            changeTheme(selectedTheme);

            // Close modal after selection
            document.getElementById('themeModal').classList.remove('active');
            document.getElementById('overlay').classList.remove('active');
        });
    });
}

// Change application theme
window.changeTheme = function (themeName) {
    const themeStylesheet = document.getElementById('theme-style');

    // Update theme stylesheet link
    if (themeName === 'light') {
        themeStylesheet.href = 'assets/css/light-theme.css';
    } else if (themeName === 'dark') {
        themeStylesheet.href = 'assets/css/dark-theme.css';
    }

    // Save theme preference to localStorage
    localStorage.setItem('preferred-theme', themeName);
}

// Close modals when clicking the close button or overlay
window.setupModalClosers = function () {
    const closeButtons = document.querySelectorAll('.close-modal');
    const overlay = document.getElementById('overlay');

    closeButtons.forEach(button => {
        button.addEventListener('click', closeAllModals);
    });

    overlay.addEventListener('click', closeAllModals);
}

window.closeAllModals = function () {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        modal.classList.remove('active');
    });
    document.getElementById('overlay').classList.remove('active');
}

// Handle form submission for profile edits
window.setupEditFormSubmission = function () {
    const editForm = document.getElementById('editForm');

    editForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const fieldId = this.dataset.fieldId;
        let newValue;

        // Get the appropriate value based on field type
        if (fieldId === 'profileGender') {
            newValue = document.getElementById('genderSelect').value;
        } else if (fieldId === 'profileDob') {
            const dateInput = document.getElementById('dobInput').value;
            // Convert YYYY-MM-DD to DD/MM/YYYY
            const dateParts = dateInput.split('-');
            newValue = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
        } else {
            newValue = document.getElementById('editInput').value;
        }

        // Update the profile field
        document.getElementById(fieldId).textContent = newValue;

        // For demo purposes, close the modal
        closeAllModals();
    });
}

// Load saved theme from localStorage or use default
window.loadSavedTheme = function () {
    const savedTheme = localStorage.getItem('preferred-theme');
    if (savedTheme) {
        changeTheme(savedTheme);
    }
}