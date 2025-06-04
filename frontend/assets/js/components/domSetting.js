import { changeLanguage } from "../user/settingClient.js";

window.chooseTheme = function (event) {
    // Hiện các theme có sẵn
    const themeList = ["light", "dark"];

    // process
}

window.resetLanguage = async function () {
    changeLanguage().then();
}
