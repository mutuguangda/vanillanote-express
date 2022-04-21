const express = require("express")
const userCtrl = require("@/controller/system/user")
const userValidator = require("@/validator/user")
const auth = require("@/middleware/auth")

const router = express.Router()

// 添加用户
router.post("/user", userCtrl.addUser)

// 查看用户相关数据
router.get('/user', auth, userCtrl.getAddUserInfo)

// 查询授权角色
router.get('/user/authRole/:userId', userCtrl.getAddUserInfo)

// 用户状态修改
router.put('/user/changeStatus', userCtrl.changeStatus)

// 用户密码重置
router.put('/user/resetPwd', userCtrl.resetPwd)

// 修改用户
router.put("/user", userCtrl.updateUser)

// 获取用户列表
router.get('/user/list', userCtrl.listUser)

// 删除用户
router.delete('/user/:userId', userCtrl.deleteUser)

// 获取用户信息
router.get('/user/:userId', userCtrl.getUser)

module.exports = router
