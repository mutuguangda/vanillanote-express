const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { User } = require("../model");
const md5 = require("../util/md5");

exports.register = validate([
  // 1. 配置验证规则
  body("userName")
    .notEmpty()
    .withMessage("用户名不能为空")
    .custom(async (value) => {
      // 查询数据库查看数据是否存在
      const user = await User.findOne({
        userName: value
      })
      console.log(user);
      if (user) {
        return Promise.reject("用户已存在");
      }
    }),
  body("password").notEmpty().withMessage("密码不能为空"),
  body("email")
    .notEmpty()
    .withMessage("邮箱不能为空")
    .isEmail()
    .withMessage("邮箱格式不正确")
  // .bail() // 如果错误就不向下执行
  // .custom(async (value) => {
  //   // 查询数据库查看数据是否存在
  //   const user = await User.findOne({ email: value });
  //   if (user) {
  //     return Promise.reject("邮箱已存在");
  //   }
  // }),
]);

exports.login = [
  validate([
    body("userName").notEmpty().withMessage("用户名不能为空"),
    body("password").notEmpty().withMessage("密码不能为空"),
  ]),
  validate([
    body("userName").custom(async (userName, { req }) => {
      const user = await User.findOne({ userName })
      .select([
        "userName",
        "roleIds",
        "password",
      ]);
      // 查询数据库查看数据是否存在
      if (!user) {
        return Promise.reject("用户不存在");
      }
      // 将数据挂载到请求对象中，后续的中间件也可以直接使用，就不需要重复查询了
      req.user = user;
    }),
  ]),
  validate([
    body("password").custom(async (password, { req }) => {
      if (md5(password) !== req.user.password) {
        return Promise.reject("密码错误");
      }
    }),
  ]),
];
