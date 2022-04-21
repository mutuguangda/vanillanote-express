const express = require("express")
const recommendationCtrl = require("@/controller/blog/recommendation")
const auth = require("@/middleware/auth")

const router = express.Router()

// 添加推荐
router.post("/recommendation", recommendationCtrl.addRecommendation)

// 获取推荐列表
router.get('/recommendation/list', recommendationCtrl.listRecommendation)

// 修改推荐
router.put("/recommendation", recommendationCtrl.updateRecommendation)

// 同步推荐
router.get('/recommendation/sync', recommendationCtrl.syncRecommendation)

// 删除推荐
router.delete('/recommendation/:recommendationId', recommendationCtrl.deleteRecommendation)

// 获取推荐信息
router.get('/recommendation/:recommendationId', recommendationCtrl.getRecommendation)

module.exports = router