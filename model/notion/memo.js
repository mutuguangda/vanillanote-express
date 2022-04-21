const mongoose = require('mongoose')

const memoSchema = new mongoose.Schema({
  title: String,
  archive: String,
  tags: [String],
  isFinished: Boolean,
  remark: String,
  createdTime: String,
  pageId: String,
})

module.exports = memoSchema