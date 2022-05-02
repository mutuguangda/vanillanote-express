const mongoose = require('mongoose')
const baseModel = require('../base-model')

const recommendationSchema = new mongoose.Schema({
  image: String,
  title: String,
  url: String,
  article: Object,
  visit: Number,
  status: {
    type: String,
    default: '0'
  },
  isFrame: {
    type: String,
    default: '1'
  },
  ...baseModel,
})

module.exports = recommendationSchema