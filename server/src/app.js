// app.js

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const userRoutes = require('./route/User.js');
const articleRoutes = require('./route/Article.js');
const uploadRoutes = require('./route/Upload.js');

const {existsSync, mkdirSync} = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

/* express 辅助插件 */

app.use(helmet());
app.use(cors());

// 使用morgan记录HTTP请求，启用最详细的日志记录等级
app.use(morgan('dev'));

app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
}));

app.use(express.json());
app.use(express.static('public'));

/* 路由 */

app.use('/api/user', userRoutes);
app.use('/api/article', articleRoutes);
app.use('/api/upload', uploadRoutes);

/* 创建 public/upload 目录 */
const uploadsDir = 'public/upload';

// 检查目录是否存在，不存在则创建
if (!existsSync(uploadsDir)){
    console.log('Creating upload directory...');
    mkdirSync(uploadsDir, { recursive: true });
}


app.get('/', (req, res) => {
    res.send({ message: 'Hello World! This is blue-book api server' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
