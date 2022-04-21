const { verify } = require("../util/jwt");
const jwtSecret = process.env.JWT_SECRET
const { User, UserOnline } = require("../model");

// 权限认证
const mongoose = require('mongoose')
const acl = require('acl')
const aclConf = require('@/config/acl-conf')

const nodeAcl = new acl(new acl.memoryBackend());
// 使用权限配置
nodeAcl.allow(aclConf)

module.exports = async (req, res, next) => {
  try {
    // 从请求头获取token数据
    let token = req.headers['authorization'] || null
    // 验证token是否有效
    token = token ? token.split("Bearer ")[1] : null;
    // 如果无效，发送响应 401 结束响应
    if (!token) {
      return res.status(401).json({
        code: 401,
        msg: '非法的token'
      });
    }
    const decodedToken = await verify(token, jwtSecret)
    const user = await User.findById(decodedToken.userId);
    if (user) {
      const userOnline = await UserOnline.findOne({ token })
      if (!userOnline) {
        return res.status(200).json({
          code: 401,
          msg: '登录状态已过期'
        })
      } else {
        req.user = user
      }
    } else {
      return res.status(401).json({
        code: 401,
        msg: '非法的token'
      });
    }
    next();
  } catch (err) {
    // console.log(err);
    return res.status(401).json({
      code: 401,
      msg: '非法的token'
    });
  }
};
