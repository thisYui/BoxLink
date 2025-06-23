import { getSinglePost, getAllPosts, upPost, removePost, likePost, unlikePost, getListUserLikes } from "../fetchers/social.js"
import { filesToArrayBase64, dateToDMY } from "./renderData.js"

window.posting = async function (files, caption, isPublic){
    // Chuyển đổi các file ảnh sang định dạng base64
    const listData = await filesToArrayBase64(files);

    // Gửi dữ liệu lên server để đăng bài viết
    const { postID, url } = await upPost(listData, caption, isPublic);

    // Thêm post mới vào giao diện
    const profileContainer = document.getElementById('profileContainer');
    const profileBodyImages = profileContainer.querySelector(".profile-body-images");
    addPostToClient(profileBodyImages, postID, url);

    // Chuyển đến giao diện profile
    await changeTab('Profile');
}

window.deletePost = async function () {
    await removePost();  // Xóa post hiện tại

    // Cập nhật giao diện để xóa post khỏi danh sách
    // Sắp xếp lại các post còn lại
    const profileContainer = document.getElementById('profileContainer');
    const profileBodyImages = profileContainer.querySelector(".profile-body-images");
    const postID = sessionStorage.getItem("postID");  // Lấy ID của post hiện tại
    const postElement = profileBodyImages.querySelector(`[id="${postID}"]`);
    profileBodyImages.removeChild(postElement);  // Xóa post khỏi giao diện
    sessionStorage.removeItem("postID");  // Xóa ID post khỏi sessionStorage

    // Tắt modal
    document.getElementById("closePostModal").click(); // Đóng modal
}

async function showAllPost(profileBodyImages, profileCountPosts, uid) {
    // Một array <{id, url, createdAt}> chứa các post
    const posts = await getAllPosts(uid);

    // sắp xếp theo ngày tháng
    posts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Cập nhật số lượng bài viết
    profileCountPosts.textContent = posts.length;

    posts.forEach((post) => {
        const postID = post.id;
        const url = post.url;

        addPostToClient(profileBodyImages, postID, url);
    })
}

function addPostToClient(profileBodyImages, postID, url) {
    const postElement = document.createElement("div");
    postElement.className = "profile-body-images-content";
    postElement.id = postID;
    const img = document.createElement("img");
    img.src = url;

    // thêm onclick để mở modal xem chi tiết bài viết
    img.onclick = async function () {
        sessionStorage.setItem("postID", postID);  // Lưu ID bài viết vào sessionStorage

        // kiểm tra xem profile của người dùng có phải là profile hiện tại không
        const profileContainer = document.getElementById('profileContainer');
        if (profileContainer.classList.contains("hidden")) {
            // Nếu profile hiện tại không phải là profile của người dùng, uid là seachUID
            await showSinglePost(sessionStorage.getItem("searchUID"), postID, false);  // Hiển thị bài viết

        } else {
            // Nếu profile hiện tại là profile của người dùng, uid là userID
            await showSinglePost(localStorage.getItem('uid'), postID, true);  // Hiển thị bài viết
        }
    }

    postElement.appendChild(img);
    profileBodyImages.appendChild(postElement);
}

async function showSinglePost(uid, postID, owner) {
    // Lấy post từ Firestore
    const post = await getSinglePost(uid, postID);
    // id { String } id của bài viết
    // caption { String } mô tả bài viết
    // isPublic { Boolean } xác định bài viết có công khai hay không
    // createdAt { Date } thời gian tạo bài viết
    // likes { Array } danh sách id người đã like bài viết
    // urls { Array } danh sách các url của hình ảnh đính kèm

    // Show lên modal
    const imageModal = document.getElementById("imageModal");
}

async function likePostHandler() {
    const userID = sessionStorage.getItem("searchUID");
    await likePost(userID);  // Thực hiện like post

    // Thay đổi giao diện để hiển thị trạng thái đã like

}

async function unlikePostHandler() {S
    const userID = sessionStorage.getItem("searchUID");
    await unlikePost(userID);  // Thực hiện like post

    // Thay đổi giao diện để hiển thị trạng thái chưa like

}

export {
    showAllPost,
    showSinglePost,
    likePostHandler,
    unlikePostHandler
}
