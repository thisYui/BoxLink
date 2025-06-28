const authToken = {};
const timeToken = {};

function generateRandomToken(uid) {
    authToken[uid] = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    timeToken[uid] = Date.now();
    return authToken[uid];
}

function authenticateToken(uid, token_bok_link) {
    return authToken[uid] === token_bok_link;
}

function removeToken(uid) {
    if (authToken[uid]) {
        delete timeToken[uid];
        delete authToken[uid];
        return true;
    }

    return false;
}

function keepToken(uid) {
    timeToken[uid] = Date.now();
}

function checkStateToken(uid) {
    const currentTime = Date.now();

    if (timeToken[uid] && (currentTime - timeToken[uid]) < 20 * 60 * 1000) {
        // Nếu thời gian trong 20' trước đó thì token vẫn còn hiệu lực

    } else {
        // Nếu không thì xóa token
        removeToken(uid);
    }
}

module.exports = {
    generateRandomToken,
    authenticateToken,
    removeToken,
    keepToken,
    checkStateToken
}
