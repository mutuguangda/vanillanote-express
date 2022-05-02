const express = require("express")
const jobCtrl = require("@/controller/monitor/job")
const auth = require("@/middleware/auth")

const router = express.Router()

// 添加定时任务
router.post("/job", jobCtrl.addJob)

// 获取定时任务列表
router.get('/job/list', jobCtrl.listJob)

// 修改定时任务
router.put("/job", jobCtrl.updateJob)

// 删除定时任务
router.delete('/job/:jobId', jobCtrl.deleteJob)

// 获取定时任务信息
router.get('/job/:jobId', jobCtrl.getJob)

module.exports = router