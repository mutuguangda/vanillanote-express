const express = require("express")
const logCtrl = require("@/controller/log")
const logValidator = require("@/validator/log")
const auth = require("@/middleware/auth")

const router = express.Router()

// 添加日志
router.post("/log/add", logCtrl.addLog)

// 修改日志
router.put("/log", logCtrl.updateLog)

// 删除日志
router.get('/log/:logId', logCtrl.deleteLog)

// 获取日志信息
router.get('/log/:logId', logCtrl.getLog)

// 获取日志列表
router.get('/log/list', logCtrl.listLog)

module.exports = router