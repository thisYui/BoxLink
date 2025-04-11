import { getDatabase, ref, onChildAdded, push, set } from "../../config/firebaseConfig.js";

class SocketService {
  constructor(currentUserId, peerUserId) {
    this.db = getDatabase();
    this.currentUserId = currentUserId;
    this.peerUserId = peerUserId;
  }

  listenForMessages(callback) {
    const messageRef = ref(this.db, `messages/${this.currentUserId}/${this.peerUserId}`);
    onChildAdded(messageRef, (data) => {
      callback(data.val());
    });
  }

  sendMessage(text) {
    const senderRef = ref(this.db, `messages/${this.currentUserId}/${this.peerUserId}`);
    const receiverRef = ref(this.db, `messages/${this.peerUserId}/${this.currentUserId}`);

    const message = {
      text: text,
      sender: this.currentUserId,
      timestamp: Date.now(),
    };

    // Lưu vào cả 2 phía (người gửi + người nhận)
    const newMsgSender = push(senderRef);
    const newMsgReceiver = push(receiverRef);

    set(newMsgSender, message);
    set(newMsgReceiver, message);
  }
}

export default SocketService;
