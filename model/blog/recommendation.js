const mongoose = require('mongoose')
const baseModel = require('../base-model')

const recommendationSchema = new mongoose.Schema({
  image: String,
  title: String,
  url: String,
  article: String,
  visit: Number,
  status: {
    type: String,
    default: '0'
  },
  ...baseModel,
})

module.exports = recommendationSchema