// controllers/Upload.js
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/upload/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const base = 'blue-book-api';

const upload = multer({ storage: storage });

const uploadImage = (req, res) => {
    // 将文件路径转换为以 '/' 分隔的路径，并移除 'public/' 部分
    const filePath = req.file.path.replace(/\\/g, '/').replace('public/', '');
    const fileUrl = `${req.protocol}://${req.get('host')}/${base}/${filePath}`;
    res.send({ imageUrl: fileUrl });
};

module.exports = { upload, uploadImage };
