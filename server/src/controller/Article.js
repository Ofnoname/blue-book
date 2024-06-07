// controller/Article.js

const { findArticleById, createArticle, findArticles, updateArticle, deleteArticle, trueDeleteArticle } = require('../model/Article');

const postArticle = (req, res) => {
    const userId = req.user.id;
    const { title, content, imageUrls, location } = req.body;

    createArticle({userId, title, content, imageUrls, location, status: 'pending'}, (err, article) => {
        if (err) {
            return res.status(500).send({ message: 'Error creating article.' });
        }
        res.status(201).send({ articleId: article.id });
    });
};

// 用户获取自己的文章列表
const getArticleList = (req, res) => {
    const userId = req.user.id;
    const { page, pageSize, status, keyword } = req.query;

    findArticles({ page, pageSize, status, userId, keyword }, (err, articles) => {
        if (err) {
            return res.status(500).send({ message: 'Error fetching articles.' });
        }
        res.status(200).send({ articles });
    });
};

const getArticle = (req, res) => {
    const articleId = req.params.id;

    findArticleById(articleId, (err, result) => {
        if (err) {
            return res.status(500).send({ message: 'Error fetching article.' });
        }
        res.status(200).send(result);
    });
}

// 用户更新自己的文章
const putArticle = (req, res) => {
    const userId = req.user.id;
    const articleId = req.params.id;
    const { title, content, imageUrls, location } = req.body;

    updateArticle({articleId, title, content, imageUrls, location, status: 'pending'}, (err) => {
        if (err) {
            return res.status(500).send({ message: 'Error updating article.' });
        }
        res.status(200).send({ message: 'Article updated.' });
    });
};

// 用户彻底删除自己的文章
const trueDeleteArticle_s = (req, res) => {
    const userId = req.user.id;
    const articleId = req.params.id;

    trueDeleteArticle(articleId, (err) => {
        if (err) {
            return res.status(500).send({ message: 'Error deleting article.' });
        }
        res.status(200).send({ message: 'Article deleted.' });
    });
};

// 任何人都可查询已审核通过的文章列表
const getApprovedArticles = (req, res) => {
    const { page, pageSize, keyword } = req.query;

    findArticles({ page, pageSize, status: 'approved', keyword }, (err, result) => {
        if (err) {
            return res.status(500).send({ message: 'Error fetching articles.' });
        }
        res.status(200).send(result);
    });
};

// 审核人员和管理人员可查询所有文章列表
const getAllArticles = (req, res) => {
    const { page, pageSize, status, keyword } = req.query;

    findArticles({ page, pageSize, status, keyword }, (err, result) => {
        if (err) {
            return res.status(500).send({ message: 'Error fetching articles.' });
        }
        res.status(200).send(result);
    });
};

// 审核人员和管理人员可审核文章
const approveArticle = (req, res) => {
    const articleId = req.params.id;
    const { status, rejectReason } = req.body;

    updateArticle({articleId, status, rejectReason}, (err) => {
        if (err) {
            return res.status(500).send({ message: 'Error approving article.' });
        }
        res.status(200).send({ message: 'Article approved.' });

    })
}

// 管理人员可删除文章
const deleteArticle_s = (req, res) => {
    const articleId = req.params.id;

    deleteArticle(articleId, (err) => {
        if (err) {
            return res.status(500).send({ message: 'Error deleting article.' });
        }
        res.status(200).send({ message: 'Article deleted.' });
    });
};

module.exports = { postArticle, getArticle, getArticleList, putArticle, trueDeleteArticle: trueDeleteArticle_s, getApprovedArticles, getAllArticles, approveArticle, deleteArticle: deleteArticle_s };
