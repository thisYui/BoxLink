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
        }
        const p = await db.collection("posts").doc(id).collection("post").add(post);

        // Đưa hình ảnh lên Firebase Storage
        for (let i = 0; i < listData.length; i++) {
            const data = listData[i];
            const fileName = `${p.id}/${i}.${data.type}`;
            const filePath = `${id}/post/${fileName}`;

            // Upload file lên Firebase Storage
            await uploadFile(data.data, filePath);

            // Cập nhật document post với URL của hình ảnh
            await db.collection("posts").doc(id).collection("post").doc(p.id).update({
                [`urls.${i}`]: await getDownloadUrl(filePath)
            });
        }

        return p.id; // Trả về ID của post mới tạo

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
        const filePath = `${userID}/post/${postID}`;
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
        post['id'] = post.id; // Thêm ID vào đối tượng post

        return post;

    } catch (error) {
        logger.error('Error getting post:', error);
        throw new Error('Error getting post: ' + error.message);
    }
}

async function getAllUrlPosts(uid) {
    try {
        const [files] = await bucket.getFiles({ prefix: `${uid}/posts/` });
        const path = require('path');

        // Lấy danh sách postID từ thư mục (vì bạn tạo mỗi folder cho mỗi post)
        const postIDtoFileMap = {};

        files.forEach(file => {
            const parts = file.name.split('/');
            const postID = parts[2]; // `${uid}/posts/{postID}/...`

            if (postID && !postIDtoFileMap[postID]) {
                const base = path.basename(file.name);
                if (base.startsWith("0.")) {
                    postIDtoFileMap[postID] = file;
                }
            }
        });

        // Lấy post IDs từ Firestore (để đảm bảo chỉ trả về các post hợp lệ)
        const postsSnapshot = await db
            .collection("posts")
            .doc(uid)
            .collection("post")
            .get();

        const postIDs = postsSnapshot.docs.map(doc => doc.id);

        // Tạo danh sách { id, url }
        return await Promise.all(postIDs.map(async id => {
            const file = postIDtoFileMap[id];
            const url = file ? await getDownloadUrl(file) : null;
            return {id, url};
        }));

    } catch (error) {
        logger.error('Error getting all posts:', error);
        throw new Error('Error getting all posts: ' + error.message);
    }
}


module.exports = {
    createPost,
    deletePost,
    like,
    unlike,
    getPost,
    getAllUrlPosts
};