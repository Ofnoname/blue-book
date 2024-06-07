// src/routes/uploadRoutes.js

const express = require('express');
const { upload, uploadImage } = require('../controller/upload');
const {verifyJwt} = require('../middleware/auth');

const router = express.Router();

router.post('/image', verifyJwt, upload.single('image'), uploadImage);

module.exports = router;
