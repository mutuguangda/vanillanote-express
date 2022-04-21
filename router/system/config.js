const express = require("express")
const configCtrl = require("@/controller/system/config")
const auth = require("@/middleware/auth")

const router = express.Router()

// 添加参数设置
router.post("/config", configCtrl.addConfig)

// 获取参数设置列表
router.get('/config/list', configCtrl.listConfig)

// 修改参数设置
router.put("/config", configCtrl.updateConfig)

// 删除参数设置
router.delete('/config/:configId', configCtrl.deleteConfig)

// 获取参数设置信息
router.get('/config/:configId', configCtrl.getConfig)

// 获取参数设置信息
router.get('/config/key/:configKey', configCtrl.getConfigByKey)

module.exports = router