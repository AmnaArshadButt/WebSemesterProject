const express = require('express');
const { login } = require('../../../controllers/api/authController');

const router = express.Router();

router.post('/login', login);

module.exports = router;