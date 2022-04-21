const express = require("express")
const menuCtrl = require("@/controller/system/menu")
// const menuValidator = require("@/validator")
const auth = require("@/middleware/auth")

const router = express.Router()

// 添加菜单
router.post("/menu", menuCtrl.addMenu)

// 根据角色ID查询菜单下拉树结构
router.get("/menu/roleMenuTreeselect/:roleId", menuCtrl.roleMenuTreeselect)

// 修改菜单
router.put("/menu", menuCtrl.updateMenu)

// 获取菜单列表
router.get('/menu/list', menuCtrl.listMenu)

// 删除菜单
router.delete('/menu/:menuId', menuCtrl.deleteMenu)

// 获取菜单信息
router.get('/menu/:menuId', menuCtrl.getMenu)

module.exports = router
