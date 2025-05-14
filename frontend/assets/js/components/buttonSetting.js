import { turnOnOrOffNotification } from "../user/notificationProcessor";
import { deleteAccount } from "../fetchers/infoFetcher";

window.clickWiperNotification = function () {
    // Vẽ lại nút bật tắt

    turnOnOrOffNotification();
}

window.clickRemoveAccount = async function () {
    // Hiện thông báo xác nhận xóa tài khoản
    const isConfirmed = showWarning();
    if (isConfirmed) {
        await deleteAccount();
    }
}

function showWarning() {
    // Hiện thông báo xác nhận xóa tài khoản

    // if true return true
    // else return false
}