import { getProfileUser, friend } from '../fetchers/infoFetcher.js'
import { searchFriendByEmail } from "../fetchers/request.js";


async function search(email) {
    const { uid } = await searchFriendByEmail(email);
    sessionStorage.setItem("searchUID", uid);

    const profile = await getProfileUser(uid);

    // Tìm số bạn chung
    let countFriendMutual = 0;
    profile.friendList.forEach(friend => {
        if (friend in window.listChatBoxID) {
            countFriendMutual++;
        }
    });

    profile.countFriendMutual= countFriendMutual;
    return profile;
}

async function friendAction() {
    // Lấy trạng thái hiện tại của người dùng
    const status = ""; // Lấy thừ thẻ
    let typeAction;

    if (status === "friend") {
        // Xóa bạn bè
        typeAction = "unfriend";
    } else if (status === "friend-request") {
        // Thu hồi lời mời kết bạn
        typeAction = "recall-friend";
    } else if (status === "receiver-request") {
        if (confirm("Bạn có chắc chắn muốn đồng ý kết bạn?")) {
            // Đồng ý kết bạn
            // Tạo ngay một chat mới nằm ngay trên đầu danh sách
            typeAction = "accept-friend";
        } else {
            // Từ chối lời mời kết bạn
            typeAction = "cancel-friend";
        }
    } else if (status === "none") {
        // Gửi lời mời kết bạn
        typeAction = "friend-request";
    }

    // Gọi API tương ứng
    await friend(localStorage.getItem("uid"), sessionStorage.getItem("searchUID"), typeAction);

    // Cập nhật giao diện người dùng
    // chỉ cần sửa lại div
}

export {
    search,
    friendAction
}