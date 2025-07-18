const { admin, db, bucket} = require("../config/firebaseConfig.cjs");
const logger = require("../config/logger.cjs");
const { uploadFile, getDownloadUrl } = require("./fileServices.cjs");

// tạo một post mới
async function createPost(id, listData, caption, isPublic) {
    try {
        // Tạo subcollection 'posts' trong Firestore
        const post = {
            caption: caption,
            isPublic: isPublic,
            createdAt: new Date().toISOString(),
            likes: [],
            urls: [],
        }
        const p = await db.collection("posts").doc(id).collection("post").add(post);

        // Đưa hình ảnh lên Firebase Storage
        for (let i = 0; i < listData.length; i++) {
            const data = listData[i];
            const fileName = `${p.id}/${i}.${data.type}`;
            const filePath = `${id}/posts/${fileName}`;

            // Upload file lên Firebase Storage
            await uploadFile(data.data, filePath);
            const url = await getDownloadUrl(filePath);

            // Cập nhật document post với URL của hình ảnh
            await db.collection("posts").doc(id).collection("post").doc(p.id).update({
                urls: admin.firestore.FieldValue.arrayUnion(url)
            });
        }

        const postDoc = await db.collection("posts").doc(id).collection("post").doc(p.id).get();
        const postData = postDoc.data();

        return {
            postID: p.id,
            url: postData.urls[0]
        };

    } catch (error) {
        logger.error('Error creating post:', error);
        throw new Error('Error creating post: ' + error.message);
    }
}

async function deletePost(userID, postID) {
    try {
        // Xóa document post từ Firestore
        await db.collection("posts").doc(userID).collection("post").doc(postID).delete();

        // Xóa hình ảnh từ Firebase Storage
        const filePath = `${userID}/posts/${postID}`;
        await bucket.deleteFiles({ prefix: filePath });

        return true;

    } catch (error) {
        logger.error('Error deleting post:', error);
        throw new Error('Error deleting post: ' + error.message);
    }
}

async function like(userID, postID, likeID) {
    try {
        // Lấy document post từ Firestore
        await db.collection("posts").doc(postID).collection("post").doc(userID).update({
            likes: admin.firestore.FieldValue.arrayUnion(likeID)
        });

        return true;

    } catch (error) {
        logger.error('Error liking post:', error);
        throw new Error('Error liking post: ' + error.message);
    }
}

async function unlike(userID, postID, likeID) {
    try {
        // Lấy document post từ Firestore
        await db.collection("posts").doc(postID).collection("post").doc(userID).update({
            likes: admin.firestore.FieldValue.arrayRemove(likeID)
        });

        return true;

    } catch (error) {
        logger.error('Error liking post:', error);
        throw new Error('Error liking post: ' + error.message);
    }
}

async function getPost(uid, postID) {
    try {
        const postDoc = await db.collection("posts").doc(uid).collection("post").doc(postID).get();
        const post = postDoc.data();

        // tìm url của hình ảnh từ Firebase Storage
        post['id'] = postDoc.id; // Thêm ID vào đối tượng post

        return post;

    } catch (error) {
        logger.error('Error getting post:', error);
        throw new Error('Error getting post: ' + error.message);
    }
}

async function getAllUrlPosts(uid, searchUID) {
    try {
        const postRef = db.collection("posts").doc(uid).collection("post");

        const userhRef = db.collection('users').doc(searchUID);
        const userhData = await userhRef.get();
        const listFriend = userhData.data().friendList || [];
        listFriend.push(uid); // Thêm chủ sở hữu vào danh sách bạn bè

        const snapshot = await postRef.get();
        const results = [];
        snapshot.forEach(doc => {
            const post = doc.data();

            if (post.isPublic === false && !listFriend.includes(searchUID)) {
                return; // Bỏ qua bài viết không công khai nếu không phải chủ sở hữu
            }

            results.push({
                id: doc.id,
                url: post.urls?.[0] || null,
                createdAt: post.createdAt || null
            });
        });

        return results;

    } catch (error) {
        logger.error('Error getting all posts:', error);
        throw new Error('Error getting all posts: ' + error.message);
    }
}

async function getListLiker(uid, postID) {
    try {
        const postDoc = await db.collection("posts").doc(uid).collection("post").doc(postID).get();
        const post = postDoc.data();

        // Lấy danh sách người đã like bài viết
        const listLiker = post.likes;
        const result = [];

        const userDoc = await db.collection("users").doc(uid).get();
        const userData = userDoc.data();

        for (let i = 0; i < listLiker.length; i++) {
            const likerID = listLiker[i];
            const friendDoc = await db.collection("users").doc(likerID).get();
            const friendData = friendDoc.data();

            const liker = {
                id: likerID,
                displayName: friendData.displayName || '',
                avatar: friendData.avatar || '',
            };

            if (likerID === uid) {
                liker['relationship'] = 'owner';
            } else if (userData.friendList.includes(likerID)) {
                liker['relationship'] = 'friend';
            } else if (userData.friendRequests.includes(likerID)) {
                liker['relationship'] = 'request';
            } else if (userData.Received.includes(likerID)) {
                liker['relationship'] = 'received';
            } else {
                liker['relationship'] = 'none';
            }

            result.push(liker);
        }

        return result;

    } catch (error) {
        logger.error('Error getting list of likers:', error);
        throw new Error('Error getting list of likers: ' + error.message);
    }
}

module.exports = {
    createPost,
    deletePost,
    like,
    unlike,
    getPost,
    getAllUrlPosts,
    getListLiker
};