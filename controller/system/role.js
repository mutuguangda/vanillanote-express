const { Role } = require("@/model");

// 添加角色
exports.addRole = async (req, res, next) => {
  try {
    const role = await new Role(req.body).save()
    const saveRole = role.toJSON();
    // 4. 发送成功响应
    res.status(201).json({
      code: 200,
      msg: '操作成功',
      role: saveRole
    });
  } catch (err) {
    next(err);
  }
};

// 更新角色
exports.updateRole = async (req, res, next) => {
  try {
    const role = req.body
    await Role.findOneAndUpdate({ roleId: role.roleId }, role)
    res.status(200).json({
      code: 200,
      msg: '操作成功'
    })
  } catch (err) {
    next(err)
  }
};

// 获得角色列表
exports.listRole = async (req, res, next) => {
  console.log('list role');
  try {
    // 默认取到 5 个
    const { pageNum, pageSize, roleName, roleKey, status, createdTime } = req.query;
    const filter = {}
    if (roleName) filter.roleName = roleName
    if (roleKey) filter.roleKey = roleKey
    if (status) filter.status = status
    if (createdTime) filter.createdTime = createdTime
    const roles = await Role.find(filter)
      .skip((pageNum - 1) * pageSize) // 跳过多少条
      .limit(+pageSize) // 取多少条
      .sort({
        roleSort: 1
      })
    // 角色总数
    const rolesCount = await Role.countDocuments();
    res.status(200).json({
      msg: '成功',
      code: 200,
      rows: roles,
      total: rolesCount,
    });
  } catch (err) {
    next(err);
  }
}

// 获得角色信息
exports.getRole = async (req, res, next) => {
  try {
    const roleId = req.params.roleId
    const role = await Role.findOne({ roleId })
    if (!role) {
      return res.status(404).end();
    }
    res.status(200).json({
      code: 200,
      msg: '操作成功',
      data: role,
    });
  } catch (err) {
    next(err);
  }
}

// 删除角色
exports.deleteRole = async (req, res, next) => {
  try {
    const roleId = req.params.roleId
    const role = await Role.findOneAndDelete({ roleId })
    if (!role) {
      return res.status(404).end();
    }
    res.status(200).json({
      code: 200,
      msg: '操作成功',
      role,
    });
  } catch (err) {
    next(err);
  }
}