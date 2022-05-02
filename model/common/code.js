// 验证码
const mongoose = require('mongoose')
const { v4: uuidv4 } = require('uuid');

const codeSchema = new mongoose.Schema({
  text: String,
  uuid: {
    type: String,
    default: uuidv4
  },
  createdTime: {
    type: Date,
    default: Date.now,
    index: { expires: 60 * 4 } // 4分钟
  },
  data: String
})

module.exports = codeSchema