const express = require("express")
const roleCtrl = require("@/controller/system/role")
// const roleValidator = require("@/validator")
const auth = require("@/middleware/auth")

const router = express.Router()

// 添加角色
router.post("/role", roleCtrl.addRole)

// 修改角色
router.put("/role", roleCtrl.updateRole)

// 获取角色列表
router.get('/role/list', roleCtrl.listRole)

// 获取角色信息
router.get('/role/:roleId', roleCtrl.getRole)

// 删除角色
router.delete('/role/:roleId', roleCtrl.deleteRole)

module.exports = router
