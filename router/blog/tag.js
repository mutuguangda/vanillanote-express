const express = require("express")
const tagCtrl = require("@/controller/blog/tag")
const auth = require("@/middleware/auth")

const router = express.Router()

// 添加标签
router.post("/tag", tagCtrl.addTag)

// 获取标签列表
router.get('/tag/list', tagCtrl.listTag)

// 修改标签
router.put("/tag", tagCtrl.updateTag)

// 同步标签
router.get('/tag/sync', tagCtrl.syncTag)

// 删除标签
router.delete('/tag/:tagId', tagCtrl.deleteTag)

// 获取标签信息
router.get('/tag/:tagId', tagCtrl.getTag)

module.exports = router