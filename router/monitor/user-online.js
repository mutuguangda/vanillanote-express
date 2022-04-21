const express = require("express")
const userOnlineCtrl = require("@/controller/monitor/user-online")
const auth = require("@/middleware/auth")

const router = express.Router()

// 获取在线用户列表
router.get('/online/list', userOnlineCtrl.listUserOnline)

// 强退用户
router.delete('/online/:userOnlineId', userOnlineCtrl.deleteUserOnline)


module.exports = router