const express = require('express');
const productsRouter = require('./products');
const authRouter = require('./auth');
const userRouter = require('./user');
const ordersRouter = require('./orders');

const router = express.Router();

router.use('/auth', authRouter);
router.use('/user', userRouter);
router.use('/orders', ordersRouter);
router.use('/products', productsRouter);

module.exports = router;