const express = require('express');
const verifyToken = require('../../../middlewares/api/verifyToken');
const { createOrder } = require('../../../controllers/api/orderController');

const router = express.Router();

router.post('/', verifyToken, createOrder);

module.exports = router;