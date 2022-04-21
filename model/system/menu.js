const mongoose = require('mongoose')
const baseModle = require("../base-model")

const menuSchema = new mongoose.Schema({
  menuId: Number,
  menuName: String,
  component: String,
  icon: String,
  isCache: String,
  isFrame: String,
  menuType: String,
  orderNum: Number,
  params: Map,
  parentId: Number,
  parentName: String,
  path: String,
  perms: String,
  query: String,
  remark: String,
  children: {
    type: Array,
    default: []
  },
  status: {
    type: String,
    default: '0',
  },
  visible: String,
  ...baseModle,
})

module.exports = menuSchema