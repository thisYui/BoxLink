const { admin, db } = require("firebase-admin");
const axios = require("axios");
const cheerio = require("cheerio");
const urlModule = require("url");

// Lấy thông tin url
async function getWebsitePreview(url) {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        // Lấy tiêu đề
        const title = $('title').text().trim();

        // Lấy mô tả nếu có
        const description = $('meta[name="description"]').attr('content') ||
                            $('meta[property="og:description"]').attr('content') || '';

        // Lấy ảnh đại diện nếu có (ưu tiên Open Graph)
        const ogImage = $('meta[property="og:image"]').attr('content') ||
                        $('meta[name="twitter:image"]').attr('content') || '';

        // Fallback: lấy favicon nếu không có ảnh đại diện
        let favicon = $('link[rel="icon"]').attr('href') ||
                      $('link[rel="shortcut icon"]').attr('href') || '';

        // Hoàn chỉnh URL nếu thiếu https://
        const baseUrl = new urlModule.URL(url);
        if (favicon && !favicon.startsWith('http')) {
            favicon = baseUrl.origin + (favicon.startsWith('/') ? favicon : '/' + favicon);
        }

        const thumbnail = ogImage || favicon;

        return {
            title,
            url,
            description,
            thumbnail
        };
    } catch (err) {
        console.error('Error fetching preview:', err.message);
        return null;
    }
}

// Tìm kiếm người dùng
async function searchUser(uid, email) {
    try {
        // Tìm user từ email
        const userRecord = await admin.auth().getUserByEmail(email);

        // Truy cập document của user trong Firestore
        const userRef = db.collection("users").doc(userRecord.uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            console.log("Không tìm thấy người dùng.");
            return null;
        }

        const userData = userDoc.data();

        // Kiểm tra xem người dùng đã kết bạn hay chưa
        const friendList = userData.friendList || [];  // List email
        const friendRequests = userData.friendRequests || [];  // List email
        const friendReceived = userData.friendReceived || [];  // List email

        let status = "none"; // Trạng thái mặc định là không có gì
        if (friendList.includes(email)) {
            status = "friend"; // Đã kết bạn
        } else if (friendRequests.includes(email)) {
            status = "sender-request"; // Đã gửi lời mời kết bạn
        } else if (friendReceived.includes(email)) {
            status = "receiver-request"; // Đã nhận lời mời kết bạn
        }

        return {
            displayName: userData.displayName,
            email: userRecord.email,
            avatar: userData.avatar,
            status: status
        }
    } catch (error) {
        console.error("Lỗi khi tìm kiếm người dùng:", error);
        return null;
    }
}

// Lấy link ảnh đại diện
async function getAvatar(friendID) {
    try {
        const user = await db.collection("users").doc(friendID).get();
        const userData = user.data();

        if (!userData) {
            console.log("Không tìm thấy người dùng.");
            return null;
        }

        return userData.avatar;
    } catch (error) {
        console.error("Lỗi khi lấy ảnh đại diện:", error);
        return null;
    }
}

module.exports = {
    searchUser,
    getAvatar,
    getWebsitePreview,
}