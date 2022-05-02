const mongoose = require("mongoose");
const baseModle = require("../base-model");
const md5 = require("@/util/md5");

const userSchema = new mongoose.Schema({
  userId: { type: Number },
  userName: { type: String, required: true },
  nickName: { type: String },
  email: { type: String },
  password: {
    type: String,
    required: true,
    set: (value) => md5(value),
    select: false,
  },
  bio: { type: String },
  avatar: { type: String },
  roleIds: { type: [String], default: 'guest' },
  status: { type: String, default: '0' },
  ...baseModle,
});
module.exports = userSchema;