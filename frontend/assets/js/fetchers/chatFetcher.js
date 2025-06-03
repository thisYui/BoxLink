//Tạo trang chat mới
async function createChat() {
    try {
        const response = await fetch("http://localhost:3000/api/message/create-chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                chatID: sessionStorage.getItem("chatID"),  // Lấy chatID từ sessionStorage
                uid: localStorage.getItem("uid")  // Lấy uid từ localStorage
            })
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        return await response.json();  // Trả về kết quả xóa
    } catch (error) {
        console.error("Error creating chat:", error);
    }
}

//Xóa đoạn chat
async function removeChat() {
    try {
        const response = await fetch("http://localhost:3000/api/message/remove-chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                chatID: sessionStorage.getItem("chatID"),  // Lấy chatID từ sessionStorage
                uid: localStorage.getItem("uid")  // Lấy uid từ localStorage
            })
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        return await response.json();  // Trả về kết quả xóa
    } catch (error) {
        console.error("Error deleting chat:", error);
    }
}


// Tạo phiên mới với user được chọn thông qua email
async function startChatSession(friendID) {
    try {
        const response  = await fetch("http://localhost:3000/api/message/start-chat-session", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                uid: localStorage.getItem("uid"),  // Lấy uid từ localStorage
                friendID: friendID
            })
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        return await response.json();  // Trả về ID của cuộc trò chuyện mới

    } catch (error) {
        console.error("Error starting chat session:", error);
    }
}

// Gửi yêu cầu lấy đoạn tin nhắn
async function fetchMessages() {
    try {
        const response = await fetch("http://localhost:3000/api/message/fetch-messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                chatID: sessionStorage.getItem("chatID"),  // Lấy chatID từ sessionStorage
            })
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        return await response.json();  // Danh sách tin nhắn
    } catch (error) {
        console.error("Error fetching messages:", error);
    }
}

// Lấy 1 đoạn tin nhắn
async function getSingleMessage(srcID, messageID) {
    try {
        const response = await fetch("http://localhost:3000/api/message/get-single-message", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                uid: localStorage.getItem("uid"),
                srcID: srcID,
                messageID: messageID
            })
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        return await response.json();  // Danh sách tin nhắn
    } catch (error) {
        console.error("Error fetching single message:", error);
    }
}

// Gửi yêu cầu gửi tin nhắn
async function sendMessages(friendID, type, content, replyTo) {
    try {
        const response = await fetch("http://localhost:3000/api/message/send-messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                chatID: sessionStorage.getItem("chatID"),  // Lấy chatID từ sessionStorage
                uid: localStorage.getItem("uid"),  // Lấy uid từ localStorage
                friendID: friendID,
                type: type,
                content: content,
                replyTo: replyTo
            })
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        return await response.json();  // Trả về ID của tin nhắn đã gửi
    } catch (error) {
        console.error("Error sending messages:", error);
    }
}

// Cập nhật thời gian truy cập
async function updateTimestampMessage() {
    try {
        const response = await fetch("http://localhost:3000/api/message/update-seen-message", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                friendID: sessionStorage.getItem("lastClickedUser"),  // Lấy chatID từ sessionStorage
                uid: localStorage.getItem("uid")  // Lấy uid từ localStorage
            })
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        return await response.json();  // Trả về kết quả cập nhật
    } catch (error) {
        console.error("Error updating seen message style:", error);
    }
}

// Tải thêm tin nhắn
async function loadMoreMessages() {
    try {
        const response = await fetch("http://localhost:3000/api/message/load-more-messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                chatID: sessionStorage.getItem("chatID"),  // Lấy chatID từ sessionStorage
            })
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        return await response.json();  // Danh sách tin nhắn
    } catch (error) {
        console.error("Error loading more messages:", error);
    }
}

// Click vào file cần tải
async function downloadFile(filePath) {
    try {
        const response = await fetch("http://localhost:3000/api/message/download-file", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                filePath: filePath
            })
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        return await response.json();  // Danh sách tin nhắn
    } catch (error) {
        console.error("Error downloading file:", error);
    }
}

// Bật tắt thông báo
async function toggleNotification() {
    try {
        const response = await fetch("http://localhost:3000/api/message/toggle-notification", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                uid: localStorage.getItem("uid"),  // Lấy uid từ localStorage
                friendID: sessionStorage.getItem("lastClickedUser")  // Lấy friendID từ sessionStorage
            })
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        return await response.json();  // Trả về kết quả cập nhật
    } catch (error) {
        console.error("Error toggling notification:", error);
    }
}

export {
    createChat,
    removeChat,
    startChatSession,
    fetchMessages,
    getSingleMessage,
    updateTimestampMessage,
    sendMessages,
    loadMoreMessages,
    downloadFile,
    toggleNotification
}