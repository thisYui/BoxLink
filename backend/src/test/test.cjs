const admin = require("firebase-admin");
const path = require("path");

// Load service account key
const serviceAccount = require(path.resolve(__dirname, "../../serviceAccountKey.json"));

// Khởi tạo Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// 👉 Thay bằng userId thật
const userId = "XiG6IjdZzmYNgVZjMLENVdMBJiq1";

const userDocRef = db.collection("users").doc(userId);

// --- Đọc dữ liệu 1 lần ---
userDocRef.get()
    .then((doc) => {
        if (!doc.exists) {
            console.log("⚠️ User document does not exist.");
            return;
        }

        const data = doc.data();
        console.log("📄 [Once] Full user document data:\n", JSON.stringify(data, null, 2));
    })
    .catch((err) => {
        console.error("❌ Error reading user document:", err);
    });

// --- Lắng nghe realtime ---
console.log(`Listening for realtime changes in user document ${userId}...\n`);

userDocRef.onSnapshot((doc) => {
    if (!doc.exists) {
        console.log("User document does not exist (snapshot).");
        return;
    }

    const data = doc.data().notifications;
    if (data && data.length > 0) {
        console.log("[Realtime] User document changed:\n", JSON.stringify(data, null, 2));
    }
});
