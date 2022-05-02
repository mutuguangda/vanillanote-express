const express = require("express")
const router = express.Router()

// 用户相关路由
router.use(require('./user-online'))

// 定时任务相关路由
router.use(require('./job'))

module.exports = router
