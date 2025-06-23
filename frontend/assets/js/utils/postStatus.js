const imageInput = document.getElementById("imageInput");
const postModal = document.getElementById("postModal");
const previewImage = document.getElementById("previewImage");
const dotsContainer = document.getElementById("dotsContainer");
const closeModal = document.getElementById("closePostModal");
const prevBtn = document.querySelector(".post-modal-prev-btn");
const nextBtn = document.querySelector(".post-modal-next-btn");
const removeImageBtn = document.getElementById("removeImageBtn");

const addMoreImageBtn = document.getElementById("addMoreImageBtn");
const addImageInput = document.getElementById("addImageInput");
const submitPostBtn = document.getElementById("submitPost");

let imageFiles = [];
let currentIndex = 0;

imageInput.addEventListener("change", (e) => {
    const newFiles = Array.from(e.target.files);
    if (newFiles.length === 0) return;

    imageFiles = imageFiles.concat(newFiles); // nối thêm
    if (imageFiles.length === newFiles.length) currentIndex = 0; // lần đầu
    showImage(currentIndex);
    createDots();
    updateDots();
    checkIndex()
    postModal.classList.remove("hidden");

    // Reset input để cho phép chọn cùng 1 ảnh sau đó
    imageInput.value = "";
});

closeModal.addEventListener("click", () => {
    postModal.classList.add("hidden");
    imageInput.value = ""; // Clear the input
    previewImage.src = ""; // Clear the preview image
    imageFiles = []; // Clear the image files array
    currentIndex = 0; // Reset the current index
    dotsContainer.innerHTML = ""; // Clear the dots
    document.getElementById('postCaption').value = ""; // Clear the caption input
});


function showImage(index) {
    const file = imageFiles[index];
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function createDots() {
    dotsContainer.innerHTML = "";
    imageFiles.forEach((_, index) => {
        const dot = document.createElement("span");
        dot.addEventListener("click", () => {
            currentIndex = index;
            showImage(currentIndex);
            updateDots();
            checkIndex();
        });
        dotsContainer.appendChild(dot);
    });
}

function updateDots() {
    const dots = dotsContainer.querySelectorAll("span");
    dots.forEach((dot, index) => {
        dot.classList.toggle("active", index === currentIndex);
    });
}

function checkIndex() {
    prevBtn.style.display = currentIndex === 0 ? "none" : "block";
    nextBtn.style.display = currentIndex === imageFiles.length - 1 ? "none" : "block";
}

prevBtn.addEventListener("click", () => {
    currentIndex = (currentIndex - 1 + imageFiles.length) % imageFiles.length;
    showImage(currentIndex);
    updateDots();
    checkIndex();
});

nextBtn.addEventListener("click", () => {
    currentIndex = (currentIndex + 1) % imageFiles.length;
    showImage(currentIndex);
    updateDots();
    checkIndex();
});

removeImageBtn.addEventListener("click", () => {
    if (imageFiles.length === 0) return;

    imageFiles.splice(currentIndex, 1); // xóa ảnh
    if (currentIndex >= imageFiles.length) {
        currentIndex = imageFiles.length - 1;
    }

    if (imageFiles.length === 0) {
        postModal.classList.add("hidden");
        return;
    }

    showImage(currentIndex);
    createDots();
    updateDots();
    checkIndex();
});

// Khi nhấn dấu cộng → kích hoạt input ẩn
addMoreImageBtn.addEventListener("click", () => {
    addImageInput.click();
});

// Khi chọn thêm ảnh
addImageInput.addEventListener("change", (e) => {
    const newFiles = Array.from(e.target.files);
    if (newFiles.length === 0) return;

    imageFiles = imageFiles.concat(newFiles);
    currentIndex = imageFiles.length - newFiles.length; // chuyển tới ảnh mới đầu tiên
    showImage(currentIndex);
    createDots();
    updateDots();

    addImageInput.value = ""; // reset lại input
});

submitPostBtn.addEventListener("click", () => {
    const caption = document.getElementById("postCaption").value;

    //Giá trị là friends-only hoặc public
    const visibility = document.getElementById("visibilitySelect").value;
    

    // Giả sử bạn in ra thử:
    console.log("Caption:", caption);
    console.log("Visibility:", visibility);
    console.log("Số ảnh:", imageFiles.length);
    console.log("Ảnh: ", imageFiles);

    postModal.classList.add("hidden");
    imageInput.value = ""; // Clear the input
    previewImage.src = ""; // Clear the preview image
    imageFiles = []; // Clear the image files array
    currentIndex = 0; // Reset the current index
    dotsContainer.innerHTML = ""; // Clear the dots
    document.getElementById('postCaption').value = ""; // Clear the caption input

    return caption && visibility && imageFiles.length > 0;  
});