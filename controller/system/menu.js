const { Menu } = require("@/model")

// 添加菜单
exports.addMenu = async (req, res, next) => {
  try {
    const menu = await new Menu(req.body).save()
    const saveMenu = menu.toJSON()
    // 4. 发送成功响应
    res.status(201).json({
      code: 200,
      msg: '操作成功',
      menu: saveMenu
    })
  } catch (err) {
    next(err)
  }
}

// 更新菜单
exports.updateMenu = async (req, res, next) => {
  try {
    const menu = req.body
    await Menu.findOneAndUpdate({ menuId: menu.menuId }, menu)
    res.status(200).json({
      code: 200,
      msg: '操作成功'
    })
  } catch (err) {
    next(err)
  }
}

// 根据角色ID查询菜单下拉树结构
exports.roleMenuTreeselect = async (req, res, next) => {
  try {
    // const roleId = req.params.roleId
    // const menu = req.body
    // await Menu.findOneAndUpdate({ menuId: menu.menuId }, menu)
    const routers = []
    const checkedKeys = []
    const categories = await Menu.find({ parentId: 0 })
      .sort({
        // 排序
        // -1：倒序   1：升序
        orderNum: 1,
      });
    for (const category of categories) {
      const categoryRouter = {
        id: category.menuId,
        label: category.menuName,
      }
      const menus = await Menu.find({ parentId: category.menuId })
        .sort({
          // 排序
          // -1：倒序   1：升序
          orderNum: 1,
        });
      // checkedKeys.push(category.menuId)
      if (menus) categoryRouter.children = []
      for (const menu of menus) {
        const menuRouter = {
          id: menu.menuId,
          label: menu.menuName
        }
        categoryRouter.children.push(menuRouter)
        checkedKeys.push(menu.menuId)
      }
      routers.push(categoryRouter)
    }
    res.status(200).json({
      code: 200,
      msg: '操作成功',
      menus: routers,
      checkedKeys
    })
  } catch (err) {
    next(err)
  }
}

// 获得菜单列表
exports.listMenu = async (req, res, next) => {
  try {
    // 默认取到 5 个
    const { pageNum, pageSize, menuName, status } = req.query
    const filter = {}
    if (menuName) filter.menuName = menuName
    if (status) filter.status = status
    const menus = await Menu.find(filter)
      .skip((pageNum - 1) * pageSize) // 跳过多少条
      .limit(+pageSize) // 取多少条
      .sort({
        // 排序
        // -1：倒序   1：升序
        orderNum: 1,
      });
    // 菜单总数
    const menusCount = await Menu.countDocuments()
    res.status(200).json({
      msg: '成功',
      code: 200,
      rows: menus,
      total: menusCount,
    })
  } catch (err) {
    next(err)
  }
}

// 获得菜单信息
exports.getMenu = async (req, res, next) => {
  try {
    const menuId = req.params.menuId
    const menu = await Menu.findOne({ menuId })
    if (!menu) {
      return res.status(404).end()
    }
    res.status(200).json({
      code: 200,
      msg: '操作成功',
      data: menu,
    })
  } catch (err) {
    next(err)
  }
}

// 删除菜单
exports.deleteMenu = async (req, res, next) => {
  try {
    const menuId = req.params.menuId
    await Menu.findOneAndDelete({ menuId })
    res.status(200).json({
      code: 200,
      msg: '操作成功'
    });
  } catch (err) {
    next(err);
  }
}