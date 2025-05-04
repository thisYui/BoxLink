window.lastClickedUser = sessionStorage.getItem("lastClickedUser") || null;
console.log("Last clicked user: ",window.lastClickedUser);
window.loadPage().then();
// Đăng ký sự kiện click cho tất cả phần tử có class là "item"
document.addEventListener("DOMContentLoaded", () => {

    const chatContainer = document;
    chatContainer.addEventListener("click", (event) => {
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
                        loadChat();
                    }
                    console.log(`Người dùng được chọn: ${window.lastClickedUser}`);
                } catch (error) {
                    console.error("Lỗi khi tải chat:", error);
                }
            }
        }
    });
});
