const express = require("express");
const router = express.Router();

// 用户相关路由
router.use(require("./user"));

// 用户资料相关路由
// router.use(require("./profile"));
router.use("/profiles", require("./profile"));

// 文章相关路由
router.use("/article", require("./article"));

// 标签相关路由
router.use(require("./tag"));

// 网站配置
router.use('/site', require('./site'))

// 专题管理
router.use(require("./topic"));

module.exports = router;
