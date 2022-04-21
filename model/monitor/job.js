// 定时任务
const mongoose = require("mongoose");
const baseModel = require('../base-model')

const userOnlineSchema = new mongoose.Schema({
  cron: String,
  jobName: String,
  params: Map,
  status: {
    type: String,
    default: '0'
  },
  desc: String,
  jobHandler: String,
  ...baseModel,
});

module.exports = userOnlineSchema;
