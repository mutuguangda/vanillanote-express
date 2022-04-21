const mongoose = require('mongoose')
const baseModle = require('../base-model')

const topicSchema = new mongoose.Schema({
  title: String,  // 标题
  visit: Number,  // 访问数
  articles: Array,  // 系列文章
  articlesNum: Number,
  pageId: String,
  ...baseModle,
  topicName: String,
  topicColor: String, 
  visit: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    default: '0'
  }
})

module.exports = topicSchema