// Khởi tạo kết nối tới server
const socket = io("http://localhost:3000");

socket.on("connect", () => {
    const uid = localStorage.getItem("uid"); // Lấy email từ localStorage
    socket.emit("registerUser", { uid }); // Gửi userId cho server ngay sau khi kết nối
});

socket.on("disconnect", () => {
    console.log("Disconnected from server.");
});

socket.on("notifications", async (data) => {
    const listNotif = data.notifications;  // Danh sách thông báo
    for (const notifDiv of listNotif) {
        await window.processingNotification(notifDiv);  // Gọi hàm xử lý thông báo
    }
});
