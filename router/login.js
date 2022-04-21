const express = require("express")
const loginCtrl = require("@/controller/login")
const loginValidator = require("@/validator/login")
const auth = require("@/middleware/auth")

const router = express.Router()

// 用户登录
router.post("/login", loginValidator.login, loginCtrl.login)

// 获取当前用户信息
router.get('/getInfo', auth, loginCtrl.getInfo)

// 获取路由
router.get('/getRouters', loginCtrl.getRouters)

// 注销
router.post('/logout', loginCtrl.logout)

module.exports = router
