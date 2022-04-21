const mongoose = require('mongoose')
const baseModle = require('../base-model')

const tagSchema = new mongoose.Schema({
  ...baseModle,
  visit: {
    type: Number,
    default: 0
  }, 
  tagName: String,
  tagColor: String,
  articlesNum: Number, // 文章数
  status: {
    type: String,
    default: '0'
  }
})

module.exports = tagSchema