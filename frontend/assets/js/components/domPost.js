let imageFiles = [];
let currentIndex = 0;

document.getElementById("imageInput").addEventListener("change", (e) => {
    const newFiles = Array.from(e.target.files);
    if (newFiles.length === 0) return;

    imageFiles = imageFiles.concat(newFiles); // nối thêm
    if (imageFiles.length === newFiles.length) currentIndex = 0; // lần đầu
    showImage(currentIndex);
    createDots();
    updateDots();
    checkIndex()
    document.getElementById("postModal").classList.remove("hidden");

    // Reset input để cho phép chọn cùng 1 ảnh sau đó
    document.getElementById("imageInput").value = "";
});

document.getElementById("closePostModal").addEventListener("click", () => {
    document.getElementById("postModal").classList.add("hidden");
    document.getElementById("imageInput").value = ""; // Clear the input
    document.getElementById("previewImage").src = ""; // Clear the preview image
    imageFiles = []; // Clear the image files array
    currentIndex = 0; // Reset the current index
    document.getElementById("dotsContainer").innerHTML = ""; // Clear the dots
    document.getElementById('postCaption').value = ""; // Clear the caption input
});


function showImage(index) {
    const file = imageFiles[index];
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById("previewImage").src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function createDots() {
    document.getElementById("dotsContainer").innerHTML = "";
    imageFiles.forEach((_, index) => {
        const dot = document.createElement("span");
        dot.addEventListener("click", () => {
            currentIndex = index;
            showImage(currentIndex);
            updateDots();
            checkIndex();
        });

        document.getElementById("dotsContainer").appendChild(dot);
    });
}

function updateDots() {
    const dots = document.getElementById("dotsContainer").querySelectorAll("span");
    dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === currentIndex);
    });
}

function checkIndex() {
    document.querySelector(".post-modal-prev-btn").style.display = currentIndex === 0 ? "none" : "block";
    document.querySelector(".post-modal-next-btn").style.display = currentIndex === imageFiles.length - 1 ? "none" : "block";
}

document.querySelector(".post-modal-prev-btn").addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + imageFiles.length) % imageFiles.length;
    showImage(currentIndex);
    updateDots();
    checkIndex();
});

document.querySelector(".post-modal-next-btn").addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % imageFiles.length;
    showImage(currentIndex);
    updateDots();
    checkIndex();
});

document.getElementById("removeImageBtn").addEventListener("click", () => {
    if (imageFiles.length === 0) return;

    imageFiles.splice(currentIndex, 1); // xóa ảnh
    if (currentIndex >= imageFiles.length) {
        currentIndex = imageFiles.length - 1;
    }

    if (imageFiles.length === 0) {
        document.getElementById("postModal").classList.add("hidden");
        return;
    }

    showImage(currentIndex);
    createDots();
    updateDots();
    checkIndex();
});

// Khi nhấn dấu cộng → kích hoạt input ẩn
document.getElementById("addMoreImageBtn").addEventListener("click", () => {
    document.getElementById("addImageInput").click();
});

// Khi chọn thêm ảnh
document.getElementById("addImageInput").addEventListener("change", (e) => {
    const newFiles = Array.from(e.target.files);
    if (newFiles.length === 0) return;

    imageFiles = imageFiles.concat(newFiles);
    currentIndex = imageFiles.length - newFiles.length; // chuyển tới ảnh mới đầu tiên
    showImage(currentIndex);
    createDots();
    updateDots();

    document.getElementById("addImageInput").value = ""; // reset lại input
});

document.getElementById("submitPost").addEventListener("click", async () => {
    const caption = document.getElementById("postCaption").value;

    //Giá trị là friends-only hoặc public
    const visibility = document.getElementById("visibilitySelect").value;
    const isPublic = visibility === "public"; // Kiểm tra xem có phải là công khai không

    if (caption.trim() === "") {
        const captionInput = document.getElementById("postCaption");
        captionInput.placeholder = t("social.caption-alert");
        captionInput.classList.add("red-placeholder");
        return;
    }

    if (visibility && imageFiles.length > 0) {
        await window.posting(imageFiles, caption, isPublic);
    }

    document.getElementById("closePostModal").click(); // Đóng modal
});