
function showTable(id) {
    var table = document.getElementById(id);
    if (table.style.display === "none") {
        table.style.display = "block"; // Hiển thị bảng
    } else {
        table.style.display = "none"; // Ẩn bảng
    }
}