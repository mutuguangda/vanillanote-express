const express = require("express")
const dictTypeCtrl = require("@/controller/system/dict-type")
const auth = require("@/middleware/auth")

const router = express.Router()

// 添加字典类型
router.post("/dict/type", dictTypeCtrl.addDictType)

// 获取字典类型列表
router.get('/dict/type/list', dictTypeCtrl.listDictType)

// 修改字典类型
router.put("/dict/type", dictTypeCtrl.updateDictType)

// 删除字典类型
router.delete('/dict/type/:dictTypeId', dictTypeCtrl.deleteDictType)

// 获取字典类型信息
router.get('/dict/type/:dictTypeId', dictTypeCtrl.getDictType)

module.exports = router