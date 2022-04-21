const express = require("express")
const router = express.Router()

// 用户相关路由
router.use(require('./user'))

// 角色相关路由
router.use(require('./role'))

// 菜单相关路由
router.use(require('./menu'))

// 字典类型相关路由
router.use(require('./dict-type'))

// 字典数据相关路由
router.use(require('./dict-data'))

// 参数设置相关路由
router.use(require('./config'))

module.exports = router
