const express = require("express")
const topicCtrl = require("@/controller/blog/topic")
const auth = require("@/middleware/auth")

const router = express.Router()

// 添加专题
router.post("/topic", topicCtrl.addTopic)

// 获取专题列表
router.get('/topic/list', topicCtrl.listTopic)

// 修改专题
router.put("/topic", topicCtrl.updateTopic)

// 同步专题
router.get('/topic/sync', topicCtrl.syncTopic)

// 删除专题
router.delete('/topic/:topicId', topicCtrl.deleteTopic)

// 获取专题信息
router.get('/topic/:topicId', topicCtrl.getTopic)

module.exports = router