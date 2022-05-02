const { User, UserOnline, Menu, Code, Role } = require("@/model")
const UAParser = require("ua-parser-js");
const jwt = require("@/util/jwt")
const createCode = require('@/util/code')

// 用户登录
exports.login = async (req, res, next) => {
  try {
    // 处理请求
    const user = req.user
    const ua = UAParser(req.headers['user-agent'])
    const { browser: browserMap, os: osMap } = ua
    const browser = `${browserMap.name} ${browserMap.major}`
    const os = `${osMap.name} ${osMap.version}`
    const ipaddr = req.headers['x-real-ip'] || req.headers['x-forwarded-for']
    // 生成token
    let token = await jwt.sign( 
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      // 设置token过期时间，单位为秒
      {
        expiresIn: 60 * 60 * 24,  // 24小时
      }
    );
    // 将token存入在线用户表
    const userOnline = await new UserOnline({
      userName: user.userName,
      // browser: ua.browser
      ipaddr,
      browser,
      os,
      token
    }).save()
    token = 'Bearer ' + token
    // 发送成功响应
    res.status(200).json({
      code: 200,
      token,
    });
  } catch (err) {
    next(err);
  }
};

// 获取当前用户信息
exports.getInfo = async (req, res, next) => {
  try {
    const user = req.user
    res.status(200).json({
      code: 200,
      msg: '操作成功',
      permissions: [
        '*:*:*'
      ],
      roles: user.roleIds,
      user,
    })
  } catch (err) {
    next(err);
  }
};

// 获取验证码
exports.captchaImage = async (req, res, next) => {
  try {
    // const code = await new Code({ img: cr })
    const code = createCode()
    const saveCode = await new Code(code).save()
    res.status(200).json({
      code: 200,
      msg: '操作成功',
      img: saveCode.data,
      uuid: saveCode.uuid,
    })
  } catch (err) {
    next(err);
  }
};

// 获取路由
exports.getRouters = async (req, res, next) => {
  try {
    // const user = req.user
    // const role = await Role.findOne({ roleName: user.roleName })
    // const menuIds = role.menuIds
    const routers = []
    const categories = await Menu.find({ parentId: 0 })
      .sort({
        // 排序
        // -1：倒序   1：升序
        orderNum: 1,
      });
    for (const category of categories) {
      // if (menuIds.indexOf(categories.menuId) === -1) continue
      const categoryRouter = {
        name: category.path.replace(/^\S/, s => s.toUpperCase()),
        path: `/${category.path}`,
        hidden: category.visiable === '0',
        redirect: 'noRedirect',
        component: 'Layout',
        alwaysShow: true,
        meta: {
          title: category.menuName,
          icon: category.icon,
          noCache: category.isCache === '0',
          link: category.link
        }
      }
      const menus = await Menu.find({ parentId: category.menuId })
        .sort({
          // 排序
          // -1：倒序   1：升序
          orderNum: 1,
        });
      if (menus) categoryRouter.children = []
      for (const menu of menus) {
        const menuRouter = {
          name: menu.path.replace(/^\S/, s => s.toUpperCase()),
          path: `/${category.path}/${menu.path}`,
          hidden: menu.visiable === '0',
          component: menu.component,
          meta: {
            title: menu.menuName,
            icon: menu.icon,
            noCache: menu.isCache === '0',
            link: menu.link
          }
        }
        categoryRouter.children.push(menuRouter)
      }
      routers.push(categoryRouter)
    }
    return res.status(200).json({
      msg: '成功',
      code: 200,
      data: routers
    })
  } catch (err) {
    next(err);
  }
}

// 注销
exports.logout = async (req, res, next) => {
  try {
    const authorization = req.headers['authorization']
    const token = authorization?.split("Bearer ")[1]
    await UserOnline.findOneAndDelete({ token })
    res.status(200).json({
      code: 200,
      msg: '操作成功',
    })
  } catch (err) {
    next(err);
  }
};