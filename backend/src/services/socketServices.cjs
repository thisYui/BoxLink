const { admin} = require("../config/firebaseConfig.cjs");
const serviceAccount = require("../../serviceAccountKey.json");

const db = admin.firestore();

// 👉 Thay bằng userId thật
const userId = "XiG6IjdZzmYNgVZjMLENVdMBJiq1";

const userDocRef = db.collection("users").doc(userId);

// --- Lắng nghe realtime ---
console.log(`👂 Listening for realtime changes in user document ${userId}...\n`);

userDocRef.onSnapshot((doc) => {
    if (!doc.exists) {
        console.log("⚠️ User document does not exist (snapshot).");
        return;
    }

    const noti = doc.data().notifications;
    if (noti && noti.length > 0) {
        console.log("[Realtime] User document changed:\n", JSON.stringify(noti, null, 2));
    }
});
