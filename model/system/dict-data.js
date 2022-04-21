const mongoose = require('mongoose')
const baseModle = require("../base-model")

const dictDataSchema = new mongoose.Schema({
  dictDataId: Number,
  cssClass: String,
  default: {
    type: Boolean,
    default: true,
  },
  dictLabel: String,
  dictSort: Number,
  dictType: String,
  dictValue: String,
  isDefault: String,
  listClass: String,
  params: Map,
  remark: String,
  status: {
    type: String,
    default: '0'
  },
  ...baseModle,
})

module.exports = dictDataSchema