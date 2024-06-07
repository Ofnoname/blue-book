const express = require('express');
const { postArticle, getArticleList, putArticle, deleteArticle, getApprovedArticles, getAllArticles, approveArticle, trueDeleteArticle,
    getArticle
} = require('../controller/Article');
const {verifyJwt, isOwner, hasRole, isVisible} = require('../middleware/auth');

const router = express.Router();

router.post('/', verifyJwt, postArticle); // 所有登录用户都可以创建文章
router.get('/', verifyJwt, getArticleList); // 个人文章列表
router.get('/all', verifyJwt, hasRole('admin', 'reviewer'), getAllArticles); // 仅管理员和审核员可以查看所有文章
router.get('/approved', getApprovedArticles); // 所有人可以查看已通过审核的文章列表
router.get('/:id', isVisible, getArticle);
router.put('/:id', verifyJwt, isOwner, putArticle); // 仅文章拥有者可以修改
router.delete('/:id', verifyJwt, isOwner, deleteArticle); // 仅文章拥有者可以删除
router.put('/:id/approve', verifyJwt, hasRole('admin', 'reviewer'), approveArticle); // 仅管理员和审核员可以审核文章
router.delete('/:id/true', verifyJwt, hasRole('admin'), trueDeleteArticle); // 仅管理员可以彻底删除文章


module.exports = router;
