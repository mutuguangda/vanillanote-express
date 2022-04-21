const express = require("express")
const router = express.Router()

// 文章相关路由
router.use(require('./article'))

// 标签相关路由
router.use(require('./tag'))

// 专题相关路由
router.use(require('./topic'))

// 评论相关路由
router.use(require('./comment'))

// 推荐相关路由
router.use(require('./recommendation'))

module.exports = router
