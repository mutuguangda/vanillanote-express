const { User, UserLog, UserOnline, Role } = require("@/model");
const jwt = require("@/util/jwt");
const res = require("express/lib/response");
const jwtSecret = process.env.JWT_SECRET

// 添加用户
exports.addUser = async (req, res, next) => {
  try {
    const user = new User(req.body)
    await user.save()
    const saveUser = user.toJSON();
    delete saveUser.password;
    // 4. 发送成功响应
    res.status(201).json({
      code: 200,
      msg: '操作成功',
      user: saveUser
    });
  } catch (err) {
    next(err);
  }
};

// 查看用户相关数据
exports.getAddUserInfo = async (req, res, next) => {
  try {
    const user = req.user
    const roles = await Role.find({})
    res.status(200).json({
      code: 200,
      msg: '操作成功',
      roles,
    })
  } catch (error) {
    next(err);
  }
}

// 用户状态修改
exports.changeStatus = async (req, res, next) => {
  try {
    const { userId, status } = req.body
    console.log(userId, status);
    const user = await User.findOneAndUpdate({ userId }, {
      status
    })
    res.status(200).json({
      code: 200,
      msg: '操作成功',
    })
  } catch (err) {
    next(err);
  }
};

// 用户状态修改
exports.resetPwd = async (req, res, next) => {
  try {
    const { userId, password } = req.body
    await User.findOneAndUpdate({ userId }, {
      password
    })
    res.status(200).json({
      code: 200,
      msg: '操作成功',
    })
  } catch (err) {
    next(err);
  }
};



// 更新用户
exports.updateUser = async (req, res, next) => {
  try {
    const user = req.body
    await User.findOneAndUpdate({ userId: user.userId }, user)
    res.status(200).json({
      code: 200,
      msg: '操作成功'
    })
  } catch (err) {
    next(err)
  }
};

// 获得用户列表
exports.listUser = async (req, res, next) => {
  try {
    // 默认取到 5 个
    const { pageNum, pageSize, userName, email, status, createdTime } = req.query;
    const filter = {}
    if (userName) filter.userName = userName
    if (email) filter.email = email
    if (status) filter.status = status
    if (createdTime) filter.createdTime = createdTime
    const users = await User.find(filter)
      .skip((pageNum - 1) * pageSize) // 跳过多少条
      .limit(+pageSize) // 取多少条
    // .sort({
    //   // 排序
    //   // -1：倒序   1：升序
    //   visit: -1,
    // });
    const usersCount = await User.countDocuments();
    res.status(200).json({
      msg: '成功',
      code: 200,
      rows: users,
      total: usersCount,
    });
  } catch (err) {
    next(err);
  }
}

// 获得用户信息
exports.getUser = async (req, res, next) => {
  try {
    const userId = req.params.userId
    const user = await User.findOne({ userId })
    if (!user) {
      return res.status(404).end();
    }
    res.status(200).json({
      code: 200,
      msg: '操作成功',
      data: user,
    });
  } catch (err) {
    next(err);
  }
}

// 删除用户
exports.deleteUser = async (req, res, next) => {
  try {
    const userId = req.params.userId
    const user = await User.findOneAndDelete({ userId })
    if (!user) {
      return res.status(404).end();
    }
    res.status(200).json({
      code: 200,
      msg: '操作成功',
    });
  } catch (err) {
    next(err);
  }
}