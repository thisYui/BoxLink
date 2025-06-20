import { loadLanguage, getListLanguage, getThemeList, getKeyLanguage } from "../config/i18n.js";
import { settingConfig, changeSettingLanguage, changeSettingNotification, changeSettingTheme } from "../fetchers/infoFetcher.js"
import { turnOnOrOffNotification } from "../user/notificationProcessor.js";

const mappingThemes = [
        "assets/css/light-theme.css",
        "assets/css/dark-theme.css"
    ];

window.loadSettings = async function () {
    const { theme, language, turnOnNotification } = await settingConfig();

    await loadLanguage(language);

    const notif = document.getElementById("notificationToggle");
    const i = document.createElement("i");

    if (turnOnNotification) {
        i.classList.add('fa', 'fa-toggle-on');
        i.addEventListener('click', async () => {
           await toggleNotification(true);
        });

    } else {
        i.classList.add('fa', 'fa-toggle-off');
        i.addEventListener('click', async () => {
            await toggleNotification(false);
        });
    }
    notif.appendChild(i);

    const themeList = getThemeList();
    const themeSelect = document.getElementById("themeSelect");
    const optionTheme = document.createElement("option");
    optionTheme.value = themeList[theme]
    optionTheme.textContent = themeList[theme]
    themeSelect.appendChild(optionTheme);

    // đổi giao diện
    document.getElementById("theme-style").href = mappingThemes[theme];

    themeList.forEach(th => {
        if (th !== themeList[theme]) {
            const option = document.createElement("option");
            option.value = th;
            option.textContent = th;
            themeSelect.appendChild(option);
        }
    });

    themeSelect.addEventListener("change", async (event) => {
        const selectedTheme = event.target.value;
        const th = themeList.indexOf(selectedTheme);
        await changeSettingTheme(th);

        // Chuyển đổi giao diện
        applyTheme(selectedTheme);
    });

    const languageSelect = document.getElementById("languageSelect");
    const optionLang = document.createElement("option");
    optionLang.value = t("settings.this-language");
    optionLang.textContent = t("settings.this-language");
    languageSelect.appendChild(optionLang);

    const languages = getListLanguage();
    languages.forEach(th => {
        if (th !== t("settings.this-language")) {
            const option = document.createElement("option");
            option.value = th;
            option.textContent = th;
            languageSelect.appendChild(option);
        }
    });

    languageSelect.addEventListener("change", async (event) => {
        const selectedLanguage = event.target.value;
        // Chuyển đổi ngôn ngữ
        await applyLanguage(selectedLanguage);
    });
}

window.openModal = function (modalId) {
    const modals = {
        password: document.getElementById("changePasswordModal"),
        logout: document.getElementById("logoutConfirmModal"),
        deleteAccount: document.getElementById("deleteAccountConfirmModal")
    };

    for (const id in modals) {
        modals[id].classList.add("hidden");
    }

    if (modals[modalId]) {
        modals[modalId].classList.remove("hidden");
    }

    const overlay = document.querySelector(".overlay");
    if (modalId === 'closeModal') {
        overlay.classList.add("hidden");
    } else {
        overlay.classList.remove("hidden");
    }
}

async function toggleNotification(toggle) {
    const notif = document.getElementById("notificationToggle");
    const i = notif.querySelector('.fa');

    if (toggle) {
        i.classList.remove('fa-toggle-on');
        i.classList.add('fa-toggle-off');
        await changeSettingNotification(false);

    } else {
        i.classList.remove('fa-toggle-off');
        i.classList.add('fa-toggle-on');
        await changeSettingNotification(true);
    }

    turnOnOrOffNotification();  // Thay đổi trạng thái thông báo
}

function applyTheme(theme) {
    const themeList = getThemeList();
    for (let i = 0; i < themeList.length; i++) {
        if (themeList[i] === theme) {
            document.getElementById("theme-style").href = mappingThemes[i];
            break;
        }
    }
}


async function applyLanguage(language) {
    const languages = getListLanguage();
    const keyLanguage = getKeyLanguage();

    for (let i = 0; i < languages.length; i++) {
        if (languages[i] === language) {
            document.documentElement.setAttribute('lang', keyLanguage[i]);
            await loadLanguage(keyLanguage[i]);  // Tải ngôn ngữ mới
            await changeSettingLanguage(keyLanguage[i]);
            break;
        }
    }
}