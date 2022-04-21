const mongoose = require('mongoose')

const seqSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  userSeq: { type: Number },
  roleSeq: { type: Number },
  menuSeq: Number,
  dictTypeSeq: Number,
  dictDataSeq: Number,
  configSeq: Number,
  articleSeq: Number,
  commentSeq: Number
})

module.exports = seqSchema