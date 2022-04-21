const { Config } = require("@/model");

// 添加参数设置
exports.addConfig = async (req, res, next) => {
  try {
    const config = await new Config(req.body).save()
    const saveConfig = config.toJSON();
    // 4. 发送成功响应
    res.status(201).json({
      code: 200,
      msg: '操作成功',
      config: saveConfig
    });
  } catch (err) {
    next(err);
  }
};

// 更新参数设置
exports.updateConfig = async (req, res, next) => {
  try {
    const config = req.body
    await Config.findOneAndUpdate({ configId: config.configId }, config)
    res.status(200).json({
      code: 200,
      msg: '操作成功'
    })
  } catch (err) {
    next(err)
  }
};

// 获得参数设置列表
exports.listConfig = async (req, res, next) => {
  console.log('list config');
  try {
    // 默认取到 5 个
    const { pageNum, pageSize, configName, configKey, status, createdTime } = req.query;
    const filter = {}
    if (configName) filter.configName = configName
    if (configKey) filter.configKey = configKey
    if (status) filter.status = status
    if (createdTime) filter.createdTime = createdTime
    const configs = await Config.find(filter)
      .skip((pageNum - 1) * pageSize) // 跳过多少条
      .limit(+pageSize) // 取多少条
      .sort({
        configSort: 1
      })
    // 参数设置总数
    const configsCount = await Config.countDocuments();
    res.status(200).json({
      msg: '成功',
      code: 200,
      rows: configs,
      total: configsCount,
    });
  } catch (err) {
    next(err);
  }
}

// 获得参数设置信息
exports.getConfig = async (req, res, next) => {
  try {
    const configId = req.params.configId
    const config = await Config.findOne({ configId })
    if (!config) {
      return res.status(404).end();
    }
    res.status(200).json({
      code: 200,
      msg: '操作成功',
      data: config,
    });
  } catch (err) {
    next(err);
  }
}

// 获得参数设置值
exports.getConfigByKey = async (req, res, next) => {
  try {
    const configKey = req.params.configKey
    const config = await Config.findOne({ configKey })
    if (!config) {
      return res.status(404).end();
    }
    res.status(200).json({
      code: 200,
      msg: config.configValue,
    });
  } catch (err) {
    next(err);
  }
}

// 删除参数设置
exports.deleteConfig = async (req, res, next) => {
  try {
    const configId = req.params.configId
    const config = await Config.findOneAndDelete({ configId })
    if (!config) {
      return res.status(404).end();
    }
    res.status(200).json({
      code: 200,
      msg: '操作成功',
      config,
    });
  } catch (err) {
    next(err);
  }
}