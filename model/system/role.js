const mongoose = require('mongoose')
const baseModel = require('../base-model')

const articleSchema = new mongoose.Schema({
  // 角色自增id
  roleId: {
    type: Number,
  },
  // 角色名称
  roleName: {
    type: String,
    required: true
  },
  // 角色权限字符
  roleKey: {
    type: String,
  },
  // 角色排序
  roleSort: {
    type: Number,
  },
  // 角色状态
  status: {
    type: String,
    default: '0'
  },
  // 备注
  remark: {
    type: String
  },
  // 角色菜单权限数据
  menuIds: {
    type: [String],
  },
  menuCheckStrictly: {
    type: Boolean,
    default: true,
  },
  dataScope: String,
  delFlag: String,
  flag: {
    type: Boolean,
    default: false,
  },
  params: Map,
  remark: String,
  ...baseModel,
})

module.exports = articleSchema