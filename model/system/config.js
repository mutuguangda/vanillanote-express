const mongoose = require('mongoose')
const baseModle = require("../base-model")

const dictDataSchema = new mongoose.Schema({
  configId: Number,
  configKey: String,
  configName: String,
  configType: String,
  configValue: String,
  params: Map,
  remark: String,
  status: {
    type: String,
    default: '0'
  },
  ...baseModle,
})

module.exports = dictDataSchema