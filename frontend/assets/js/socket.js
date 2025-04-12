// Khởi tạo kết nối tới server
const socket = io("http://localhost:3000");

socket.on("connect", () => {
    const uid = localStorage.getItem("uid"); // Lấy email từ localStorage
    socket.emit("registerUser", { uid }); // Gửi userId cho server ngay sau khi kết nối
});

socket.on("disconnect", () => {
    console.log("Disconnected from server.");
});

socket.on("notifications", (data) => {
    console.log("Notifications received:", data);
    const notifDiv = document.getElementById("notifications");
    notifDiv.innerHTML = `
        <h3>Notifications for ${data.userId}</h3>
        <ul>
            ${data.notifications.map(n => `<li>${n}</li>`).join('')}
        </ul>
    `;
});

