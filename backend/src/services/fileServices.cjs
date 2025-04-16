const { bucket } = require("../config/firebaseConfig.cjs");
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');

/*
3. Firebase Storage:
  Dung lượng lưu trữ: 5 GB
  Download Bandwidth: 1 GB mỗi tháng
  Upload Bandwidth: Không giới hạn
  Số lượng hoạt động Download: 50.000 hoạt động mỗi tháng
  Số lượng hoạt động Upload: 50.000 hoạt động mỗi tháng
*/

// Đường dẫn tới thư mục Downloads trên Windows và macOS/Linux
const downloadFolder = process.platform === 'win32'
  ? path.join(process.env.USERPROFILE, 'Downloads') // Đối với Windows
  : path.join(process.env.HOME, 'Downloads'); // Đối với macOS/Linux

// Hàm đưa tệp từ URL lên firebase Storage
async function uploadFile(filePath, storagePath) {
    try {
        await bucket.upload(filePath, {
            destination: storagePath,  // ChatID/filename
            metadata: {
                contentType: mime.lookup(filePath), // Lấy loại mime từ tệp
            },
        });

        console.log(`${filePath} đã được tải lên ${storagePath}`);
    } catch (error) {
        console.error('Lỗi khi tải tệp lên:', error);
    }
}

// Hàm tải tệp từ Firebase Storage về thư mục Downloads
async function downloadFile(filePath) {
    const srcFile = bucket.file(filePath); // Lấy đối tượng file từ bucket
    const fileName = path.basename(filePath); // 'filename.txt'
    const destination = path.join(downloadFolder, fileName); // Đường dẫn tệp tải về

    try{
        srcFile.download()
        .then((data) => {
            const contents = data[0]; // Dữ liệu tệp đã tải về dưới dạng buffer

            // Ghi buffer vào tệp trên thư mục Downloads
            fs.writeFile(destination, contents, (err) => {
                if (err) {
                    console.error('Error saving file:', err);
                } else {
                    console.log('File saved successfully at:', destination);
                }
            });
        })
        .catch((err) => {
            console.error('Error downloading file:', err);
        });
    } catch (error) {
        console.error('Error downloading file:', error);
    }
}

// Hàm lấy URL tải về tệp từ Firebase Storage
async function getDownloadUrl(filePath) {
    try {
        const file = bucket.file(filePath);

        // Kiểm tra nếu chưa có metadata thì thêm token
        const [metadata] = await file.getMetadata();

        let token = metadata.metadata?.firebaseStorageDownloadTokens;
        if (!token) {
            token = require("crypto").randomUUID();
            await file.setMetadata({
                metadata: {
                    firebaseStorageDownloadTokens: token,
                }
            });
        }

        // Tạo link theo định dạng chuẩn
        const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media&token=${token}`;
        console.log("Download URL:", url);
        return url;

    } catch (error) {
        console.error("Error getting URL:", error);
        return null;
    }
}

module.exports = {
    uploadFile,
    downloadFile,
    getDownloadUrl,
}