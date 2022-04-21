const { DictType } = require("@/model");

// 添加字典类型
exports.addDictType = async (req, res, next) => {
  try {
    const dictType = await new DictType(req.body).save()
    const saveDictType = dictType.toJSON();
    // 4. 发送成功响应
    res.status(201).json({
      code: 200,
      msg: '操作成功',
      dictType: saveDictType
    });
  } catch (err) {
    next(err);
  }
};

// 更新字典类型
exports.updateDictType = async (req, res, next) => {
  try {
    const dictType = req.body
    await DictType.findOneAndUpdate({ dictTypeId: dictType.dictTypeId }, dictType)
    res.status(200).json({
      code: 200,
      msg: '操作成功'
    })
  } catch (err) {
    next(err)
  }
};

// 获得字典类型列表
exports.listDictType = async (req, res, next) => {
  try {
    // 默认取到 5 个
    const { pageNum, pageSize, dictTypeName, status, createdTime } = req.query;
    const filter = {}
    if (dictTypeName) filter.dictTypeName = dictTypeName
    // if (dictTypeKey) filter.dictTypeKey = dictTypeKey
    if (status) filter.status = status
    if (createdTime) filter.createdTime = createdTime
    const dictTypes = await DictType.find(filter)
      .skip((pageNum - 1) * pageSize) // 跳过多少条
      .limit(+pageSize) // 取多少条
    // 字典类型总数
    const dictTypesCount = await DictType.countDocuments();
    res.status(200).json({
      msg: '成功',
      code: 200,
      rows: dictTypes,
      total: dictTypesCount,
    });
  } catch (err) {
    next(err);
  }
}

// 获得字典类型信息
exports.getDictType = async (req, res, next) => {
  try {
    const dictTypeId = req.params.dictTypeId
    const dictType = await DictType.findOne({ dictTypeId })
    if (!dictType) {
      return res.status(404).end();
    }
    res.status(200).json({
      code: 200,
      msg: '操作成功',
      data: dictType,
    });
  } catch (err) {
    next(err);
  }
}

// 删除字典类型
exports.deleteDictType = async (req, res, next) => {
  try {
    const dictTypeId = req.params.dictTypeId
    const dictType = await DictType.findOneAndDelete({ dictTypeId })
    if (!dictType) {
      return res.status(404).end();
    }
    res.status(200).json({
      code: 200,
      msg: '操作成功',
      dictType,
    });
  } catch (err) {
    next(err);
  }
}