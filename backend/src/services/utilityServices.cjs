const { admin, db } = require("../config/firebaseConfig.cjs");  // Import Firebase admin SDK
const logger = require("../config/logger.cjs");
const axios = require("axios");
const cheerio = require("cheerio");
const urlModule = require("url");
const { execFile } = require('child_process');
const ffprobePath = require('ffprobe-static').path;
const emojiList = require('emoji.json');// array
const { getProfileUser } = require("./userServices.cjs");

const emojiMap = {};

emojiList.forEach(e => {
  emojiMap[e.char] = { name: e.name, unicode: e.char };
});

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
        logger.debug(`Error fetching preview: ${err.message}`);
        return null;
    }
}

// Tìm kiếm người dùng
async function searchUserByID(friendID) {
    try {
        const friendRef = await db.collection("users").doc(friendID).get();
        const friendData = friendRef.data();
        const authFriend = await admin.auth().getUser(friendID);

        // Tìm trạng thái
        let status = "none"; // Trạng thái mặc định là không có gì

        return {
            uid: friendID,
            displayName: friendData.displayName,
            avatar: friendData.avatar,
            email: authFriend.email,
        }

    } catch (error) {
        logger.warn("Lỗi khi tìm kiếm người dùng:", error);
        return null;
    }
}

// Tìm kiếm người dùng
async function searchUserByEmail(email) {
    try {
        // Tìm user từ email
        const userRecord = await admin.auth().getUserByEmail(email);

        return await searchUserByID(userRecord.uid);

    } catch (error) {
        logger.warn("Lỗi khi tìm kiếm người dùng:", error);
        return null;
    }
}

async function getVideoDuration(filePath) {
    return new Promise((resolve, reject) => {
    execFile(ffprobePath, [
        '-v', 'error',
        '-show_entries', 'format=duration',
        '-of', 'default=noprint_wrappers=1:nokey=1',
        filePath
    ], (err, stdout) => {
        if (err) return reject(err);
        resolve(parseFloat(stdout)); // thời lượng tính bằng giây
    });
    });
}

// Hàm nội bộ
// Hàm tách emoji ra khỏi đoạn text
function processTextWithEmoji(str) {
    const chars = Array.from(str);
    const result = [];
    let buffer = "";

    for (const ch of chars) {
        if (emojiMap[ch]) {
            if (buffer) {
                result.push({ type: "text", text: buffer });
                buffer = "";
              }
              result.push({ type: "emoji", name: emojiMap[ch].name, unicode: emojiMap[ch].unicode });
        } else {
            buffer += ch;
        }
    }

    if (buffer) {
        result.push({ type: "text", text: buffer });
    }

    return result;
}

function formatRichTextFromPlain(text) {
    const urlRegex = /https?:\/\/[^\s]+/g;
    const result = []; // Mảng kết quả không chứa block

    let lastIndex = 0;

    const matches = [...text.matchAll(urlRegex)];

    // Duyệt qua các match URL
    for (const match of matches) {
        const [url] = match;
        const start = match.index;

        // Thêm đoạn text trước link
        if (start > lastIndex) {
            const before = text.slice(lastIndex, start);
            result.push(...processTextWithEmoji(before));
        }

        // Thêm link
        result.push({ type: "link", text: url, url });

        lastIndex = start + url.length;
    }

    // Xử lý phần còn lại sau link cuối cùng
    if (lastIndex < text.length) {
        result.push(...processTextWithEmoji(text.slice(lastIndex)));
    }

    return result; // Trả về danh sách các phần tử mà không có block
}

// Trạng thái của tất cả bạn bè
async function getLastOnlineObject(uid) {
    try {
        const userRef = db.collection("users").doc(uid);
        const userDoc = await userRef.get();

        if (!userDoc.exists) {
            throw new Error("User not found");
        }

        const friendList = userDoc.data().friendList || [];

        const lastOnlineObj = {};

        await Promise.all(friendList.map(async (friendID) => {
            const friendRef = db.collection("users").doc(friendID);
            const friendDoc = await friendRef.get();

            if (friendDoc.exists) {
                const data = friendDoc.data();
                lastOnlineObj[friendID] = data.lastOnline || null;
            }
        }));

        return lastOnlineObj;
    } catch (error) {
        logger.warn("Lỗi khi lấy lastOnline bạn bè:", error);
        return {};
    }
}

// tìm kiếm nhiều người dùng
async function searchByName(name) {
    try {
        const usersRef = db.collection("users");
        const snapshot = await usersRef.where("displayName", ">=", name)
                                       .where("displayName", "<=", "\uf8ff" + name + "\uf8ff")
                                       .limit(10)
                                       .get();

        if (snapshot.empty) {
            return [];
        }

        const results = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            results.push({
                uid: doc.id,
                displayName: data.displayName,
                avatar: data.avatar,
            });
        });

        await Promise.all(
            results.map(async (item) => {
                const user = await admin.auth().getUser(item.uid);
                item.email = user.email;
            })
        );

        return results;
    } catch (error) {
        logger.warn("Lỗi khi tìm kiếm người dùng:", error);
        return [];
    }
}

async function friendProfile(uid, friendID) {
    try {
        const profile = await getProfileUser(friendID);
        const userData = (await db.collection('users').doc(uid).get()).data();

        const countFriendMutual = userData.friendList.filter(friend => profile.listFriend.includes(friend)).length;

        let status = "none"; // Trạng thái mặc định là không có gì

        if (userData.friendList.includes(friendID)) {
            status = "friend"; // Đã là bạn bè
        } else if (userData.friendRequests.includes(friendID)) {
            status = "friend-request"; // Đã gửi lời mời kết bạn
        } else if (userData.friendReceived.includes(friendID)) {
            status = "receiver-request"; // Đã nhận lời mời kết bạn
        }

        profile.countFriendMutual = countFriendMutual;
        profile.status = status;

        return profile;
    } catch (error) {
        logger.warn("Lỗi khi lấy thông tin bạn bè:", error);
        return null;
    }
}


module.exports = {
    searchUserByEmail, searchUserByID,
    getWebsitePreview, getVideoDuration,
    formatRichTextFromPlain, getLastOnlineObject,
    searchByName, friendProfile
}
