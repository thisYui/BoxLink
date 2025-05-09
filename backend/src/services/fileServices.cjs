const { bucket } = require("../config/firebaseConfig.cjs");
const fs = require('fs');
const path = require('path');
const mime = require('mime-types');
const logger = require("../config/logger.cjs");

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

// Hàm tải lên dữ liệu nhị phân trực tiếp từ data lên Firebase Storage
async function uploadFile(data, storagePath) {
    try {
        // Tạo một đối tượng file blob trong Firebase Storage
        const file = bucket.file(storagePath);

        // Tạo một stream ghi dữ liệu lên Firebase Storage
        const blobStream = file.createWriteStream({
            metadata: {
                contentType: mime.lookup(storagePath),  // Xác định loại MIME từ đường dẫn
            },
        });

        // Khi quá trình tải lên hoàn thành
        blobStream.on('finish', () => {
            logger.info(`${storagePath} đã được tải lên Firebase Storage thành công`);
        });

        // Nếu có lỗi xảy ra
        blobStream.on('error', (error) => {
            logger.error('Lỗi khi tải tệp lên:', error);
        });

        // Ghi dữ liệu nhị phân vào stream
        blobStream.end(data);
    } catch (error) {
        logger.error('Lỗi khi tải tệp lên:', error);
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
                    logger.error('Error saving file:', err);
                } else {
                    logger.debug('File saved successfully at:', destination);
                }
            });
        })
        .catch((err) => {
            logger.error('Error downloading file:', err);
        });
    } catch (error) {
        logger.error('Error downloading file:', error);
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
        return `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(filePath)}?alt=media&token=${token}`;

    } catch (error) {
        logger.error("Error getting URL:", error);
        return null;
    }
}

module.exports = {
    uploadFile,
    downloadFile,
    getDownloadUrl,
}