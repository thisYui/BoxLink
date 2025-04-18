// Tạo phiên mới với user được chọn thông qua email
async function startChatSession(friendID) {
    try {
        return (await fetch("http://localhost:3000/api/start-chat-session", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                uid: 'R340SWcxQFQS4HVbe2bXDezIHOF2',//localStorage.getItem("uid"),  // Lấy uid từ localStorage
                friendID: friendID
            })
        })).ok;
    } catch (error) {
        console.error("Error starting chat session:", error);
    }
}

// Gửi yêu cầu lấy đoạn tin nhắn
async function fetchMessages() {
    try {
        const response = await fetch("http://localhost:3000/api/fetch-messages", {
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
async function sendMessages(friendID, type, content, replyTo) {
    try {
        return (await fetch("http://localhost:3000/api/send-messages", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                uid: 'R340SWcxQFQS4HVbe2bXDezIHOF2',//localStorage.getItem("uid"),  // Lấy uid từ localStorage
                friendID: friendID,
                type: type,
                content: content,
                replyTo: replyTo
            })
        })).ok;
    } catch (error) {
        console.error("Error sending messages:", error);
    }
}

// Tải thêm tin nhắn
async function loadMoreMessages() {
    try {
        const response = await fetch("http://localhost:3000/api/load-more-messages", {
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