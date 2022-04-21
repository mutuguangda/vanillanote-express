const mongoose = require('mongoose')

const articleSchema = new mongoose.Schema({
  articleId: Number, // 文章自增id
  pageId: String, // notion page id
  title: String,  // 标题
  tags: Array, // 标签
  isPublished: Boolean, // 是否发布
  publishedTime: Date,  // 发布时间
  createdTime: Date,  // 创建时间
  lastEditedTime: Date, // 最后更新时间
  createdBy: Map,  // 作者
  lastEditedBy: Map, // 最后一次编辑
  image: Array,  // 图片
  desc: String, // 描述
  visit: Number,  // 访问数
  topic: Array, // 专题
  comments: Array // 评论
})

module.exports = articleSchema