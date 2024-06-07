// auth.js

const jwt = require('jsonwebtoken');
const {findArticleById} = require("../model/Article");
const JWT_SECRET = process.env.JWT_SECRET || 'at40322024';

const verifyJwt = (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).send({message: 'A token is required for authentication'});
    }

    try {
        req.user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
        return res.status(401).send({message: 'Invalid Token'});
    }

    return next();
};

const signJwt = (user) => {
    return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
        expiresIn: 86400 // 24小时
    });
};

const isOwner = (req, res, next) => {
    const userId = req.user.id;
    const articleId = req.params.id;

    // 查询文章，确认当前用户是否为文章的拥有者
    findArticleById(articleId, (err, article) => {
        if (err || !article) {
            return res.status(404).send({ message: "Article not found." });
        }
        if (article.user_id !== userId) {
            return res.status(403).send({ message: "User is not the owner of the article." });
        }
        next();
    });
};

const hasRole = (...allowedRoles) => {
    return (req, res, next) => {
        const userRole = req.user.role;
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).send({ message: "Insufficient role." });
        }
        next();
    };
};


// 获取单篇文章需要验证用户是否为文章拥有者或者是管理员或审核员，或者文章是已审核通过的
const isVisible = (req, res, next) => {
    const articleId = req.params.id;

    findArticleById(articleId, (err, article) => {
        if (err || !article) {
            return res.status(404).send({ message: "Article not found." });
        }
        if (article.status === 'approved') {
            return next();
        }
        const token = req.headers['authorization'];
        req.user = jwt.verify(token, JWT_SECRET);

        if (req.user && (article.user_id === req.user.id || req.user.role === 'admin' || req.user.role === 'reviewer')) {
            return next();
        }
        return res.status(404).send({ message: "Article not found." });
    });
};



module.exports = {verifyJwt, signJwt, isOwner, hasRole, isVisible};
