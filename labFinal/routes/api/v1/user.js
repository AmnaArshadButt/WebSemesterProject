const express = require('express');
const verifyToken = require('../../../middlewares/api/verifyToken');
const { profile } = require('../../../controllers/api/userController');

const router = express.Router();

router.get('/profile', verifyToken, profile);

module.exports = router;