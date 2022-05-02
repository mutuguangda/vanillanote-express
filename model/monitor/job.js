const mongoose = require("mongoose");
const baseModel = require('../base-model')

const jobSchema = new mongoose.Schema({
  cron: { type: String },
  jobName: { type: String },
  params: { type: String },
  status: { type: String, default: '0' },
  desc: { type: String },
  jobHandlerName: { type: String },
  ...baseModel,
});

module.exports = jobSchema;
