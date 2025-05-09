window.lastClickedUser = sessionStorage.getItem("lastClickedUser") || null;

// Lấy dữ liệu từ database
window.loadPage().then();

// Gửi khi ấn vào máy bay giấy
document.getElementById("send-button").addEventListener("click", async (event) => {
    await sendMessage(event, 'text');
});

// Gửi khi ấn phím Enter
document.getElementById("message-input").addEventListener("keydown", async (event) => {
    if (event.key === "Enter") {
        await  sendMessage(event, 'text');
    }
});

// Gửi file khi ấn vào nút open
document.getElementById("attachment").addEventListener("change", async (event) => {
    await sendMessage(event, 'file');
});


// Đăng ký sự kiện click cho tất cả phần tử có class là "item"
document.addEventListener("DOMContentLoaded", () => {
    document.addEventListener("click", (event) => {
        const element = event.target.closest(".chat-box-area-box");
        
        // Kiểm tra nếu click vào phần tử có class chat-box-area-box
        if (element) {
            const elementId = element.id;

            if (!elementId) {
                console.warn("Phần tử được click không có ID");
                return;
            }

            if (window.lastClickedUser !== elementId) {
                // Xóa class active khỏi phần tử được chọn trước đó
                if (window.lastClickedUser) {
                    document.getElementById(window.lastClickedUser)?.classList.remove("chat-box-choosen");
                }
                // Thêm class active cho phần tử hiện tại
                element.classList.add("chat-box-choosen");
                
                window.lastClickedUser = elementId;
                sessionStorage.setItem("lastClickedUser", elementId);
                try {
                    if (typeof loadChat === "function") {
                        loadChat().then();
                    }
                    console.log(`Người dùng được chọn: ${window.lastClickedUser}`);
                } catch (error) {
                    console.error("Lỗi khi tải chat:", error);
                }
            }
        }
    });
});

window.chooseFile = function (event) {

}