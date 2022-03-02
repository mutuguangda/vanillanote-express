const mongoose = require('mongoose')

const siteSchema = new mongoose.Schema({
  title: String,  // 网站名称
  favicon: String,  // 网站图标
  keywords: Array,  // 关键字
  desc: String,   // 描述
  ICP: String,  // 备案号
  contact: Map, // 联系方式
})

module.exports = siteSchema