const express = require("express")
const commentCtrl = require("@/controller/blog/comment")
const auth = require("@/middleware/auth")

const router = express.Router()

// 添加评论
router.post("/comment", commentCtrl.addComment)

// 获取评论列表
router.get('/comment/list', commentCtrl.listComment)

// 获取评论列表
router.get('/comment/list/out', commentCtrl.listCommentForBlog)

// 修改评论
router.put("/comment", commentCtrl.updateComment)

// 同步评论
router.get('/comment/sync', commentCtrl.syncComment)

// 强制同步评论
router.get('/comment/forcedSync', commentCtrl.forcedSyncComment)

// 删除评论
router.delete('/comment/:commentId', commentCtrl.deleteComment)

// 获取评论信息
router.get('/comment/:commentId', commentCtrl.getComment)

module.exports = router