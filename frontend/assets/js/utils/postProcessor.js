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
    profileBodyImages.innerHTML = "";  // Xóa nội dung hiện tại
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

let currentPosts = [];
let postIndex = 0;
let currentGroup = [];
let currentIndex = 0;
let allPostsData = [];

async function showSinglePost(uid, postID, owner) {
    const post = await getSinglePost(uid, postID);
    console.log(post);
    // id { String } id của bài viết
    // caption { String } mô tả bài viết
    // isPublic { Boolean } xác định bài viết có công khai hay không
    // createdAt { Date } thời gian tạo bài viết
    // likes { Array } danh sách id người đã like bài viết
    // urls { Array } danh sách các url của hình ảnh đính kèm

    allPostsData = await getAllPosts(uid);
    allPostsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    postIndex = allPostsData.findIndex(p => p.id === postID);
    
    const profileContainer = document.getElementById('profileContainer').classList.contains("hidden") 
        ? document.querySelector('.profile-friend-container')
        : document.getElementById('profileContainer');
    
    currentPosts = Array.from(profileContainer.querySelectorAll(".profile-body-images-content"));
    
    // Setup modal với post hiện tại
    setupModal(post, profileContainer, owner);
    
    // Setup navigation events
    setupNavigationEvents();
}

function setupModal(post, profileContainer, owner) {
    currentGroup = post.urls;
    currentIndex = 0;
    
    const imageModal = document.getElementById("imageModal");
    imageModal.style.display = "flex";
    
    document.getElementById("postModalCaption").textContent = post.caption || "";
    document.getElementById("postModalTime").textContent = dateToDMY(post.createdAt);
    document.getElementById("postModalLikesCount").textContent = post.likes?.length || 0;
    document.getElementById("postModalAvatar").src = profileContainer.querySelector(".profile-body-basic-info-avatar").src;
    document.getElementById("postModalUsername").textContent = profileContainer.querySelector(".profile-body-basic-info-text.profile-name").textContent;

    const publicVisibility = document.createElement("i");
    publicVisibility.className = post.isPublic ? "fa-solid fa-earth-asia" : "fa-solid fa-user-group";
    document.getElementById("postModalVisibility").innerHTML = "";
    document.getElementById("postModalVisibility").appendChild(publicVisibility);
    
    if (currentGroup.length > 1) {
        createDots();
    } else {
        document.getElementById("imageDots").innerHTML = "";
    }

    updateModalImage();
    updateArrowVisibility();
}

function updateModalImage() {
    const modalImg = document.getElementById("modalImg");
    if (typeof currentGroup[currentIndex] === 'string') {
        modalImg.src = currentGroup[currentIndex];
    } else {
        modalImg.src = currentGroup[currentIndex].src;
    }
    updateArrowVisibility();
    updateDots();
}

function updateDots() {
    const dots = document.getElementById("imageDots").querySelectorAll(".dot");
    dots.forEach((dot, i) => {
        dot.classList.toggle("active", i === currentIndex);
    });
}

function createDots() {
    const dotsContainer = document.getElementById("imageDots");
    dotsContainer.innerHTML = "";
    currentGroup.forEach((_, i) => {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        if (i === currentIndex) dot.classList.add("active");

        dot.addEventListener("click", () => {
            currentIndex = i;
            updateModalImage();
        });

        dotsContainer.appendChild(dot);
    });
}

function updateArrowVisibility() {
    document.getElementById("prevImageBtn").style.display = currentIndex === 0 ? "none" : "block";
    document.getElementById("nextImageBtn").style.display = currentIndex === currentGroup.length - 1 ? "none" : "block";
    document.getElementById("prevPostBtn").style.display = postIndex === 0 ? "none" : "block";
    document.getElementById("nextPostBtn").style.display = postIndex === allPostsData.length - 1 ? "none" : "block";
}

function setupNavigationEvents() {
    const prevImageBtn = document.getElementById("prevImageBtn");
    const nextImageBtn = document.getElementById("nextImageBtn");
    const prevPostBtn = document.getElementById("prevPostBtn");
    const nextPostBtn = document.getElementById("nextPostBtn");
    const closeModal = document.getElementById("closeModal");
    const imageModal = document.getElementById("imageModal");

    prevImageBtn.replaceWith(prevImageBtn.cloneNode(true));
    nextImageBtn.replaceWith(nextImageBtn.cloneNode(true));
    prevPostBtn.replaceWith(prevPostBtn.cloneNode(true));
    nextPostBtn.replaceWith(nextPostBtn.cloneNode(true));
    closeModal.replaceWith(closeModal.cloneNode(true));

    const newPrevImageBtn = document.getElementById("prevImageBtn");
    const newNextImageBtn = document.getElementById("nextImageBtn");
    const newPrevPostBtn = document.getElementById("prevPostBtn");
    const newNextPostBtn = document.getElementById("nextPostBtn");
    const newCloseModal = document.getElementById("closeModal");

    newPrevImageBtn.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateModalImage();
        }
    });

    newNextImageBtn.addEventListener("click", () => {
        if (currentIndex < currentGroup.length - 1) {
            currentIndex++;
            updateModalImage();
        }
    });

    newPrevPostBtn.addEventListener("click", async () => {
        if (postIndex > 0) {
            postIndex--;
            const prevPost = allPostsData[postIndex];
            const profileContainer = document.getElementById('profileContainer').classList.contains("hidden") 
                ? document.querySelector('.profile-friend-container')
                : document.getElementById('profileContainer');
            
            const uid = document.getElementById('profileContainer').classList.contains("hidden") 
                ? sessionStorage.getItem("searchUID")
                : localStorage.getItem('uid');
            const fullPost = await getSinglePost(uid, prevPost.id);
            setupModal(fullPost, profileContainer, !document.getElementById('profileContainer').classList.contains("hidden"));
        }
    });

    newNextPostBtn.addEventListener("click", async () => {
        if (postIndex < allPostsData.length - 1) {
            postIndex++;
            const nextPost = allPostsData[postIndex];
            const profileContainer = document.getElementById('profileContainer').classList.contains("hidden") 
                ? document.querySelector('.profile-friend-container')
                : document.getElementById('profileContainer');
            
            const uid = document.getElementById('profileContainer').classList.contains("hidden") 
                ? sessionStorage.getItem("searchUID")
                : localStorage.getItem('uid');
            const fullPost = await getSinglePost(uid, nextPost.id);
            setupModal(fullPost, profileContainer, !document.getElementById('profileContainer').classList.contains("hidden"));
        }
    });

    newCloseModal.addEventListener("click", () => {
        imageModal.style.display = "none";
        document.getElementById("modalImg").src = "";
    });

    imageModal.addEventListener("click", (e) => {
        if (e.target === imageModal) {
            imageModal.style.display = "none";
            document.getElementById("modalImg").src = "";
        }
    });

    document.addEventListener("keydown", (e) => {
        if (imageModal.style.display === "flex") {
            if (e.key === "ArrowRight") newNextImageBtn.click();
            else if (e.key === "ArrowLeft") newPrevImageBtn.click();
            else if (e.key === "Escape") newCloseModal.click();
        }
    });
}

async function likePostHandler() {
    const userID = sessionStorage.getItem("searchUID");
    await likePost(userID);  // Thực hiện like post

    // Thay đổi giao diện để hiển thị trạng thái đã like
    // TODO: Update UI to show liked state
}

async function unlikePostHandler() {
    const userID = sessionStorage.getItem("searchUID");
    await unlikePost(userID);  // Thực hiện unlike post

    // Thay đổi giao diện để hiển thị trạng thái chưa like
    // TODO: Update UI to show unliked state
}

export {
    showAllPost,
    showSinglePost,
    likePostHandler,
    unlikePostHandler
}