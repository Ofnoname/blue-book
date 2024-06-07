// route/User.js

const express = require('express');
const { register, login, getUserInfo, updateUserProfile, updatePassword} = require('../controller/User');
// const verifyJwt = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
// router.patch('/update', verifyJwt, updateUserProfile);
// router.patch('/updatePassword', verifyJwt, updatePassword);
router.get('/:id', getUserInfo);

module.exports = router;
