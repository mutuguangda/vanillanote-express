const mongoose = require("mongoose");

const userOnlineSchema = new mongoose.Schema({
  token: {
    type: String,
    select: false
  },
  loginTime: {
    type: Date, 
    default: Date.now, 
    // index: { expires: 60 * 60 * 0.4 } // 40分钟
  },
  browser: String,
  ipaddr: String,
  loginLocation: String,
  os: String,
  userName: String,
});

module.exports = userOnlineSchema;
