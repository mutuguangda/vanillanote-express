const mongoose = require('mongoose')
const baseModle = require("../base-model")

const dictTypeSchema = new mongoose.Schema({
  dictTypeId: Number,
  dictName: String,
  dictType: String,
  params: Map,
  remark: String,
  status: {
    type: String,
    default: '0'
  },
  ...baseModle,
})

module.exports = dictTypeSchema