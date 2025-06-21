import { getSinglePost, getAllPosts, upPost, removePost, likePost, unlikePost } from "../fetchers/social.js"
import { filesToArrayBase64, dateToDMY } from "./renderData.js"

window.posting = async function (){
    // Lấy dữ liệu từ form đăng bài viết
    const { listData, caption, isPublic } = preparePostData();  // Chuẩn bị dữ liệu để đăng bài viết
    await upPost(listData, caption, isPublic);  // Gửi dữ liệu lên server để đăng bài viết

    // Chuyển đến giao diện profile
    await changeTab('Profile');
}

window.deletePost = async function () {
    await removePost();  // Xóa post hiện tại

    // Cập nhật giao diện để xóa post khỏi danh sách
    // Sắp xếp lại các post còn lại
}

async function showAllPost(profileBodyImages, uid) {
    // Một array <id, url> chứa các post
    const posts = await getAllPosts(uid);

    posts.forEach((post) => {
        const postID = post.id;
        const url = post.url;

        const postElement = document.createElement("div");
        postElement.className = "profile-body-images-content";
        postElement.id = postID;
        const img = document.createElement("img");
        img.src = url;

        profileBodyImages.appendChild(postElement);
    })
}

async function showSinglePost(uid, postID) {
    // Lấy post từ Firestore
    const post = await getSinglePost(uid, postID);
    // id { String } id của bài viết
    // caption { String } mô tả bài viết
    // isPublic { Boolean } xác định bài viết có công khai hay không
    // createdAt { Date } thời gian tạo bài viết
    // likes { Array } danh sách id người đã like bài viết
    // urls { Array } danh sách các url của hình ảnh đính kèm

    // Show lên modal
}

async function likePostHandler() {
    const userID = sessionStorage.getItem("searchUID");
    await likePost(userID);  // Thực hiện like post

    // Thay đổi giao diện để hiển thị trạng thái đã like

}

async function unlikePostHandler() {
    const userID = sessionStorage.getItem("searchUID");
    await unlikePost(userID);  // Thực hiện like post

    // Thay đổi giao diện để hiển thị trạng thái chưa like

}

/**
 * Chuẩn bị dữ liệu để đăng bài viết
 * @returns { listData, caption, isPublic }
 * @description
 * listData: Mảng chứa các tệp đính kèm đã được chuyển đổi sang định dạng Base64.
 * caption: Chuỗi mô tả bài viết.
 * isPublic: Biến boolean xác định bài viết có công khai hay không.
 */
function preparePostData() {

}