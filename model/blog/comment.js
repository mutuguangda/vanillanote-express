const mongoose = require('mongoose')
const baseModel = require('../base-model')

const commentSchema = new mongoose.Schema({
  ...baseModel,
  // 自增id
  commentId: Number,
  // 关联的文章id
  articleId: Number,
  // notion关联的文章
  article: Array,
  // 内容
  content: {
    type: String,
    required: true,
  },
  // 邮箱
  email: {
    type: String,
    required: true,
  },
  // 字母头像
  avatar: String,
  // 姓名
  name: {
    type: String,
    required: true
  },
  comment: Array,
  reply: Array,
  pageId: String,
  // 父级id,默认为0,即1级别id
  parentId: {
    type: Number,
    default: 0
  },
  children: Array
})

module.exports = commentSchema