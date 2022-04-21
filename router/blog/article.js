const express = require("express")
const articleCtrl = require("@/controller/blog/article")
const auth = require("@/middleware/auth")

const router = express.Router()

// 添加文章
router.post("/article", articleCtrl.addArticle)

// 获取文章列表
router.get('/article/list', articleCtrl.listArticle)

// 修改文章
router.put("/article", articleCtrl.updateArticle)

// 同步文章(根据修改时间大于同步时间来获得Notion文章)
router.get('/article/sync', articleCtrl.syncArticle)

// 强制同步文章
router.get('/article/forcedSync', articleCtrl.forcedSyncArticle)

// 删除文章
router.delete('/article/:articleId', articleCtrl.deleteArticle)

// 获取文章信息
router.get('/article/:articleId', articleCtrl.getArticle)

module.exports = router