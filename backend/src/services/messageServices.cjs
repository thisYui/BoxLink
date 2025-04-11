
// Format message

// Đưa tin nhắn lên Firebase

/*
JSON Message
{
  "_id": "ObjectId",
  "chatId": "123456789",            // thuộc cuộc hội thoại nào
  "senderId": "user_abc",           // ai gửi
  "type": "text",                   // text | image | file | system | rich_text | ...
  "content": {},                    // nội dung (thay đổi theo type)
  "timestamp": "2025-04-09T15:32:00Z",  // thời gian gửi
  "status": "sent",                 // sent | delivered | seen
  "replyTo": "message_id_optional" // nếu có trả lời
}

"content": {
  "blocks": [
    { "type": "text", "text": "Xem thêm tại " },
    { "type": "link", "text": "Github", "url": "https://github.com" },
    { "type": "emoji", "name": "rocket", "unicode": "🚀" }
  ]
}
"content": {
  "fileName": "report.pdf",
  "size": 28412,
  "url": "https://cdn.domain.com/files/report.pdf"
}

*
* */