const express = require("express");
const memoCtrl = require("@/controller/memo");

const router = express.Router();

// Get Tags
router.get("/list", memoCtrl.listMemo);

// 同步专题数据库
router.get('/sync', memoCtrl.syncMemo)


module.exports = router;
