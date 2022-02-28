const mongoose = require('mongoose')
const baseModle = require('./base-model')

const topicSchema = new mongoose.Schema({
  ...baseModle,
  title: String,  // 标题
  visit: Number,  // 访问数
})

module.exports = topicSchema