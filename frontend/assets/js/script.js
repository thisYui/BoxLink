
function showTable(id) {
    var table = document.getElementById(id);
    if (table.style.display === "none") {
        table.style.display = "block"; // Hiển thị bảng
    } else {
        table.style.display = "none"; // Ẩn bảng
    }
}

user =  [
    uid: "uid",
    email: "email",
    displayname: "displayname",
    status: "onl/off",
    chat: "link-to-chat",
    auth: "link",
    avater: "img",
    friendlist:"list",
    ]

chat = [
    type: "text, link, image, file",
    content: "text",
    sender: "user",
    time: "day",
    nickname: "nick",
    background: "type",
    listmenber: "list"
]