// Tạo phiên mới với user được chọn thông qua email
async function startChatSession(email) {
    try {
        return (await fetch("/api/startChatSession", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email })
        })).ok;
    } catch (error) {
        console.error("Error starting chat session:", error);
    }
}

// Gửi yêu cầu lấy đoạn tin nhắn
async function fetchMessages() {
    try {
        const response = await fetch("/api/fetchMessages", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        return await response.json();  // Danh sách tin nhắn
    } catch (error) {
        console.error("Error fetching messages:", error);
    }
}

// Gửi yêu cầu gửi tin nhắn
async function sendMessages(type, content, replyTo) {
    try {
        return (await fetch("/api/sendMessages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                type,
                content,
                replyTo
            })
        })).ok;
    } catch (error) {
        console.error("Error sending messages:", error);
    }
}

// Tải thêm tin nhắn
async function loadMoreMessages() {
    try {
        const response = await fetch("/api/loadMoreMessages", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        return await response.json();  // Danh sách tin nhắn
    } catch (error) {
        console.error("Error loading more messages:", error);
    }
}

export {
    startChatSession,
    fetchMessages,
    sendMessages,
    loadMoreMessages
}