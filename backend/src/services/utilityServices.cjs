const axios = require("axios");
const cheerio = require("cheerio");
const urlModule = require("url");
const { downloadFile } = require("./fileServices.cjs");

// Lấy thông tin url
async function getWebsitePreview(url) {
    try {
        const response = await axios.get(url);
        const html = response.data;
        const $ = cheerio.load(html);

        // Lấy tiêu đề
        const title = $('title').text().trim();

        // Lấy mô tả nếu có
        const description = $('meta[name="description"]').attr('content') ||
                            $('meta[property="og:description"]').attr('content') || '';

        // Lấy ảnh đại diện nếu có (ưu tiên Open Graph)
        const ogImage = $('meta[property="og:image"]').attr('content') ||
                        $('meta[name="twitter:image"]').attr('content') || '';

        // Fallback: lấy favicon nếu không có ảnh đại diện
        let favicon = $('link[rel="icon"]').attr('href') ||
                      $('link[rel="shortcut icon"]').attr('href') || '';

        // Hoàn chỉnh URL nếu thiếu https://
        const baseUrl = new urlModule.URL(url);
        if (favicon && !favicon.startsWith('http')) {
            favicon = baseUrl.origin + (favicon.startsWith('/') ? favicon : '/' + favicon);
        }

        const thumbnail = ogImage || favicon;

        return {
            title,
            url,
            description,
            thumbnail
        };
    } catch (err) {
        console.error('Error fetching preview:', err.message);
        return null;
    }
}

// Button khi ấn vào file
async function handleFileButtonClick(filePath) {
    try {
        // Tải tệp từ Firebase Storage về thư mục Downloads
        await downloadFile(filePath);
        console.log(`File downloaded to: ${filePath}`);
    }
    catch (error) {
        console.error('Error downloading file:', error);
    }
}

module.exports = {
    getWebsitePreview,
    handleFileButtonClick,
}