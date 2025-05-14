const admin = require("firebase-admin");

// Tạo đối tượng service account từ biến môi trường
const serviceAccount = require('../../serviceAccountKey.json');

// Khởi tạo Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`,
  storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
});

// Truy cập Firestore
const db = admin.firestore();
const auth = admin.auth();

// Các biến cấu hình khác nếu cần
const config = {
    PORT: process.env.PORT,
};

const bucket = admin.storage().bucket(`gs://${process.env.FIREBASE_STORAGE_BUCKET}`); // Khởi tạo bucket

module.exports = {
    admin,
    db,
    config,
    auth,
    bucket,
};
