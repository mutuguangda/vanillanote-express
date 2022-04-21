// 验证码
const mongoose = require('mongoose')

const codeSchema = new mongoose.Schema({
  code: String
})

module.exports = codeSchema