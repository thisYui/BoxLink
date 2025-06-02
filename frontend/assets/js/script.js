import { loadLanguage, getUserLanguage } from "./config/i18n.js";
import { updateOnlineTime } from "./fetchers/infoFetcher.js";

window.lastClickedUser = sessionStorage.getItem("lastClickedUser") || null;
window.listChatBoxID = {}

// Lấy ngôn ngữ dựa trên cài đặt của người dùng
loadLanguage(getUserLanguage()).then();

// Lấy dữ liệu từ database
loadPage().then();

// Cập nhật thời gian online mỗi phút
setInterval(() => {
    updateOnlineTime().catch(console.error);
}, 60 * 1000);

// Lấy trạng thái online của người dùng mỗi 2 phút
setInterval(() => {
    updateLastOnlineListFriend().catch(console.error);
}, 2 * 60 * 1000);

/*
// Thay đổi ngôn ngữ khi ấn vào nút
document.getElementById("reset-lang-button").addEventListener("click", async (event) => {
    event.preventDefault();
    await resetLanguage();
});

// Khi ấn vào profile
document.getElementById("profile-button").addEventListener("click", async (event) => {
    event.preventDefault();
    await showProfile("myProfile");
});

// Khi submit vào ô tìm kiếm
document.getElementById("search-button").addEventListener("click", async (event) => {
    event.preventDefault();
    await showProfile("search");
});

*/


// Đăng ký sự kiện click cho tất cả phần tử có class là "item"
document.addEventListener("DOMContentLoaded", () => {
    updateLastOnlineListFriend().then()

    document.addEventListener("click", (event) => {
        const element = event.target.closest(".chats-list-user");

        // Kiểm tra nếu click vào phần tử có class chat-box-area-box
        if (element) {
            const elementId = element.id;

            if (!elementId) {
                console.warn("Phần tử được click không có ID");
                return;
            }

            if (window.lastClickedUser !== elementId) {
                // Xóa class active khỏi phần tử được chọn trước đó
                if (window.lastClickedUser) {
                    document.getElementById(window.lastClickedUser)?.classList.remove("chat-box-choosen");
                }
                // Thêm class active cho phần tử hiện tại
                element.classList.add("chat-box-choosen");

                window.lastClickedUser = elementId;
                sessionStorage.setItem("lastClickedUser", elementId);
                try {
                    if (typeof loadChat === "function") {
                        loadChat().then();
                    }
                    console.log(`Người dùng được chọn: ${window.lastClickedUser}`);
                } catch (error) {
                    console.error("Lỗi khi tải chat:", error);
                }
            }
        }
    });

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

    // Set up event handler for Settings button in logout box
    document.getElementById('SettingButton').addEventListener('click', function() {
        changeTab('Settings');
        document.getElementById('logOutBox').classList.add('hidden');
    });

    // Handle the main logout button
    document.getElementById('logOutButton').addEventListener('click', function() {
        // Implement logout logic here
        console.log('Logging out...');
        window.location.href = 'auth.html';
    });
});


window.openChatInfo = function () {
    const chatInfor = document.getElementById('chatInfoContainer');
    const isHidden = window.getComputedStyle(chatInfor).display === 'none';
    chatInfor.style.display = isHidden ? "block" : "none";
}

// Manage tab switching functionality
window.changeTab = function (tabName) {
    document.getElementById('chatInfoContainer').style.display = 'none';
    const containers = {
        chatContainer: document.getElementById('chatContainer'),
        messageGroupContainer: document.getElementById('messageGroupContainer'),
        profileContainer: document.getElementById('profileContainer'),
        settingsContainer: document.getElementById('settingsContainer'),
    };

    const menuButtons = document.querySelectorAll('.menu-bar-button');

    // Toggle FriendList riêng
    if (tabName === 'ChatList' && !containers.messageGroupContainer.classList.contains('hidden')) {
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
            onShow: loadProfileData
        },
        Settings: {
            show: ['settingsContainer'],
            buttonId: 'Settings'
        }
    };

    if (tabMap[tabName]) {
        tabMap[tabName].show.forEach(id => containers[id].classList.remove('hidden'));
        document.getElementById(tabMap[tabName].buttonId).classList.add('menu-bar-button-choosen');
        if (tabMap[tabName].onShow) tabMap[tabName].onShow();
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


// Load user profile data (simulation - replace with actual API calls in production)
window.loadProfileData = function () {
    // This would typically be an API call to fetch user data
    // For demo purposes, we're just using the placeholder data

    // You could implement an actual fetch call like this:
    /*
    fetch('/api/user/profile')
        .then(response => response.json())
        .then(data => {
            document.getElementById('profileName').textContent = data.name;
            document.getElementById('profileBio').textContent = data.bio;
            document.getElementById('profileDob').textContent = data.dob;
            document.getElementById('profileGender').textContent = data.gender;
            document.getElementById('profileEmail').textContent = data.email;

            // Update avatar if available
            if (data.avatarUrl) {
                document.querySelector('.profile-avatar').src = data.avatarUrl;
                document.getElementById('mainAccountAvatar').src = data.avatarUrl;
            }
        })
        .catch(error => {
            console.error('Error loading profile data:', error);
        });
    */
}

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
    } else if (themeName === 'custom') {
        themeStylesheet.href = 'assets/css/custom-theme.css';
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

        // Here you would typically send an API request to update the server
        /*
        fetch('/api/user/profile/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                field: fieldId.replace('profile', '').toLowerCase(),
                value: newValue
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Update was successful
                closeAllModals();
            } else {
                // Handle error
                alert('Failed to update profile: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error updating profile:', error);
        });
        */

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