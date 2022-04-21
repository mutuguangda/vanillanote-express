const mongoose = require("mongoose");
const baseModle = require("../base-model");
const md5 = require("@/util/md5");

const userSchema = new mongoose.Schema({
  // 用户自增id
  userId: {
    type: Number,
  }, 
  // 用户名称
  userName: {
    type: String,
    required: true,
  },
  // 用户昵称
  nickName: {
    type: String,
  },
  email: {
    type: String,
  },
  // 用户密码
  password: {
    type: String,
    required: true,
    set: (value) => md5(value),
    select: false,
  },
  // 用户简介
  bio: {
    type: String,
  },
  // 用户头像
  avatar: {
    type: String,
  },
  // 用户角色数组
  roleIds: {
    type: [String],
    default: 'guest'
  },
  // 用户状态
  status: {
    type: String,
    default: '0'
  },
  ...baseModle,
});
module.exports = userSchema;
