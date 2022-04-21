const express = require("express")
const dictDataCtrl = require("@/controller/system/dict-data")
const auth = require("@/middleware/auth")

const router = express.Router()

// 添加字典数据
router.post("/dict/data", dictDataCtrl.addDictData)

// 获取字典数据列表
router.get('/dict/data/list', dictDataCtrl.listDictData)

// 修改字典数据
router.put("/dict/data", dictDataCtrl.updateDictData)

// 删除字典数据
router.delete('/dict/data/:dictDataId', dictDataCtrl.deleteDictData)

// 获取字典数据信息
router.get('/dict/data/:dictDataId', dictDataCtrl.getDictData)

// 获取字典
router.get('/dict/data/type/:dictType', dictDataCtrl.getDict)

module.exports = router