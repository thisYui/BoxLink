async function getSinglePost(postID) {
    const response = await fetch(`${host}/api/social/get-single-post`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            uid: localStorage.getItem("uid"),
            postID: postID
        })
    });

    if (!response.ok) {
        throw new Error("Failed to fetch friend status");
    }

    return await response.json();
}

async function getAllPost() {
    const response = await fetch(`${host}/api/social/get-single-post`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            uid: localStorage.getItem("uid")
        })
    });

    if (!response.ok) {
        throw new Error("Failed to fetch friend status");
    }

    return await response.json();
}

async function upPost(listData, caption, isPublic) {
    const response = await fetch(`${host}/api/social/up`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            uid: localStorage.getItem("uid"),
            listData: listData,
            caption: caption,
            isPublic: isPublic
        })
    });

    if (!response.ok) {
        throw new Error("Failed to update post");
    }

    return await response.json();
}

async function removePost(postID) {
    const response = await fetch(`${host}/api/social/remove`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            uid: localStorage.getItem("uid"),
            postID: postID
        })
    });

    if (!response.ok) {
        throw new Error("Failed to remove post");
    }

    return await response.json();
}

async function likePost(userID, postID) {
    const response = await fetch(`${host}/api/social/like`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            uid: userID,
            postID: postID,
            likeID: localStorage.getItem("uid")
        })
    });

    if (!response.ok) {
        throw new Error("Failed to like post");
    }

    return await response.json();
}

async function unlikePost(userID, postID) {
    const response = await fetch(`${host}/api/social/unlike`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            uid: userID,
            postID: postID,
            likeID: localStorage.getItem("uid")
        })
    });

    if (!response.ok) {
        throw new Error("Failed to unlike post");
    }

    return await response.json();
}

export {
    getSinglePost,
    getAllPost,
    upPost,
    removePost,
    likePost,
    unlikePost
};