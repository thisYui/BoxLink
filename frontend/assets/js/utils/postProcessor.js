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
    initPostProcessor(); 
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

function initPostProcessor() {
    let currentPosts = [];      // danh sách bài đăng hiện tại trong 1 profile
    let postIndex = 0;        // bài đăng hiện tại
    let currentGroup = [];    // ảnh trong bài
    let currentIndex = 0;     // ảnh trong nhóm

    // Khởi tạo hiển thị ảnh đầu tiên trong mỗi bài đăng
    const allPosts = document.querySelectorAll(".profile-body-images-content");
    console.log("All posts found:", allPosts);
    allPosts.forEach(container => {
        const imgs = container.querySelectorAll("img");
        imgs.forEach((img, index) => {
            img.style.display = index === 0 ? "block" : "none";
        });
    });

    // Hàm mở modal cho bài đăng
    function openModalForPost(index) {
        const post = currentPosts[index];
        currentGroup = Array.from(post.querySelectorAll("img"));
        currentIndex = 0;
        document.getElementById("imageModal").style.display = "flex";

        if (currentGroup.length > 1) {
            createDots();
        }
        updateModalImage();
        updateArrowVisibility();
    }

    // Cập nhật ảnh hiển thị trong modal
    function updateModalImage() {
        document.getElementById("modalImg").src = currentGroup[currentIndex].src;
        updateArrowVisibility();
        updateDots();
    }

    // Cập nhật trạng thái active của các dots
    function updateDots() {
        const dots = document.getElementById("imageDots").querySelectorAll(".dot");
        dots.forEach((dot, i) => {
            dot.classList.toggle("active", i === currentIndex);
        });
    }

    // Tạo dots cho navigation
    function createDots() {
        document.getElementById("imageDots").innerHTML = "";
        currentGroup.forEach((_, i) => {
            const dot = document.createElement("div");
            dot.classList.add("dot");
            if (i === currentIndex) dot.classList.add("active");

            dot.addEventListener("click", () => {
                currentIndex = i;
                updateModalImage();
            });

            document.getElementById("imageDots").appendChild(dot);
        });
    }

    // Cập nhật hiển thị các nút điều hướng
    function updateArrowVisibility() {
        document.getElementById("prevImageBtn").style.display = currentIndex === 0 ? "none" : "block";
        document.getElementById("nextImageBtn").style.display = currentIndex === currentGroup.length - 1 ? "none" : "block";
        document.getElementById("prevPostBtn").style.display = postIndex === 0 ? "none" : "block";
        document.getElementById("nextPostBtn").style.display = postIndex === currentPosts.length - 1 ? "none" : "block";
    }

    // Đóng modal
    function closeModal() {
        document.getElementById("imageModal").style.display = "none";
        document.getElementById("modalImg").src = "";
    }

    // Xử lý sự kiện click vào ảnh đầu tiên của mỗi bài đăng
    allPosts.forEach((container) => {
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

    // Xử lý sự kiện nút điều hướng ảnh trước
    document.getElementById("prevImageBtn").addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateModalImage();
        }
    });

    // Xử lý sự kiện nút điều hướng ảnh tiếp theo
    document.getElementById("nextImageBtn").addEventListener("click", () => {
        if (currentIndex < currentGroup.length - 1) {
            currentIndex++;
            updateModalImage();
        }
    });

    // Xử lý sự kiện nút điều hướng bài đăng trước
    document.getElementById("prevPostBtn").addEventListener("click", () => {
        if (postIndex > 0) {
            postIndex--;
            openModalForPost(postIndex);
        }
    });

    // Xử lý sự kiện nút điều hướng bài đăng tiếp theo
    document.getElementById("nextPostBtn").addEventListener("click", () => {
        if (postIndex < currentPosts.length - 1) {
            postIndex++;
            openModalForPost(postIndex);
        }
    });

    // Xử lý sự kiện đóng modal
    document.getElementById("closeModal").addEventListener("click", closeModal);

    // Xử lý sự kiện click bên ngoài modal để đóng
    document.getElementById("imageModal").addEventListener("click", e => {
        if (e.target === document.getElementById("imageModal")) closeModal();
    });

    // Xử lý sự kiện phím
    document.addEventListener("keydown", e => {
        if (document.getElementById("imageModal").style.display === "flex") {
            if (e.key === "ArrowRight") document.getElementById("nextImageBtn").click();
            else if (e.key === "ArrowLeft") document.getElementById("prevImageBtn").click();
            else if (e.key === "Escape") closeModal();
        }
    });
}

export {
    showAllPost,
    showSinglePost,
    likePostHandler,
    unlikePostHandler
}
