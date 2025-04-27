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
    console.log("Notifications received:", listNotif);

    for (const notifDiv of listNotif) {
        // Xử lí theo loại notification
        const { typeNotification, srcID, text} = notifDiv;
        console.log("Notification type:", typeNotification);
        console.log("Notification srcID:", srcID);
        console.log("Notification text:", text);

        if (typeNotification === "message") {
            // Theo srcID để tìm ra người gửi lấy thông tin
            const msg = await socketGetSingleMessage(srcID, text);  // text chứa id document
            //addMessage(dataMessage);  // Đưa tin nhắn vào chat
            // viết đoạn sau thành hàm tương ứng
            console.log("Message received:", msg);

            const container = document.getElementById("chat-container");

            const div = document.createElement("div");
            const isCurrentUser = msg.senderId === localStorage.getItem("uid");

            div.className = `message ${isCurrentUser ? 'right' : 'left'}`;
            div.innerHTML = `<div class="bubble">${msg.content.text}</div>`;
            container.appendChild(div);

            // Đưa tin nhắn vào chat cho 2 trường hợp
            // 1. Nếu chat là chat đang mở

            // 2. Nếu chat không phải là chat đang mở

        } else if (typeNotification === "friend-request") {
            // Load lại thông báo
            await socketFriend(srcID, localStorage.getItem("emailFriend"), "friend-request");
        } else if (typeNotification === "friend-accept") {
            // Load lại thông báo
            await socketFriend(srcID, localStorage.getItem("emailFriend"), "accept-friend");
        } else if (typeNotification === "update-avatar") {
            // Lấy avatar mới từ srcID
            const { avatar } = await socketGetAvatar(srcID);  // là 1 link url

            // Cập nhật lại avatar
        }
    }
});


