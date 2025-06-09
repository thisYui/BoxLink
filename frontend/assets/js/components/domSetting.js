import { changeLanguage } from "../user/settingClient.js";
import { loadLanguage, getListLanguage, getThemeList } from "../config/i18n.js";
import { settingConfig, changeSettingLanguage, changeSettingNotification, changeSettingTheme} from "../fetchers/infoFetcher.js"
import { turnOnOrOffNotification } from "../user/notificationProcessor.js";

window.loadSettings = async function () {
    const { theme, language, turnOnNotification } = await settingConfig();

    await loadLanguage(language);

    const notif = document.getElementById("notificationToggle");
    const i = document.createElement("i");

    if (turnOnNotification) {
        i.classList.add('fa','fa-toggle-on');
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

    themeList.forEach(th => {
        if (th !== themeList[theme]) {
            const option = document.createElement("option");
            option.value = th;
            option.textContent = th;
            themeSelect.appendChild(option);
        }
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

window.chooseTheme = function (event) {
    // Hiện các theme có sẵn
    const themeList = ["light", "dark"];

    // process
}

window.resetLanguage = async function () {
    changeLanguage().then();
}

async function toggleNotification(toggle) {
    const notif = document.getElementById("toggleNotifications");
    const i = notif.querySelector('.fa');

    if (toggle) {
        i.classList.remove('fa-toggle-off');
        i.classList.add('fa-toggle-on');
        await changeSettingNotification(location.getItem("uid"), true);
    } else {
        i.classList.remove('fa-toggle-on');
        i.classList.add('fa-toggle-off');
        await changeSettingNotification(location.getItem("uid"), false);
    }

    turnOnOrOffNotification();  // Thay đổi trạng thái thông báo
}