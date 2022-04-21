const express = require("express");
const router = express.Router();

// 系统管理相关路由
router.use('/system', require('./system/index'))

// 系统监控相关路由
router.use('/monitor', require('./monitor/index'))

// 登录相关路由(包含获取用户信息, 获取路由)
router.use(require('./login'))

// 博客管理相关路由
router.use('/blog', require('./blog/index'))

// memo管理
router.use('/memo', require('./notion/memo'))

module.exports = router;
