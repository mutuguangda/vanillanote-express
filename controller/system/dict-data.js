const { DictData } = require("@/model");

// 添加字典数据
exports.addDictData = async (req, res, next) => {
  try {
    const dictData = await new DictData(req.body).save()
    const saveDictData = dictData.toJSON();
    // 4. 发送成功响应
    res.status(201).json({
      code: 200,
      msg: '操作成功',
      dictData: saveDictData
    });
  } catch (err) {
    next(err);
  }
};

// 更新字典数据
exports.updateDictData = async (req, res, next) => {
  try {
    // 处理请求
    res.send("put /dictData");
  } catch (err) {
    next(err);
  }
};

// 获得字典数据列表
exports.listDictData = async (req, res, next) => {
  try {
    // 默认取到 5 个
    const { pageNum, pageSize, dictType, status, createdTime } = req.query;
    const filter = {}
    if (dictType) filter.dictType = dictType
    // if (dictDataKey) filter.dictDataKey = dictDataKey
    if (status) filter.status = status
    if (createdTime) filter.createdTime = createdTime
    const dictDatas = await DictData.find(filter)
      .skip((pageNum - 1) * pageSize) // 跳过多少条
      .limit(+pageSize) // 取多少条
      .sort({
        dictSort: 1
      })
    // 字典数据总数
    const dictDatasCount = await DictData.countDocuments();
    res.status(200).json({
      msg: '成功',
      code: 200,
      rows: dictDatas,
      total: dictDatasCount,
    });
  } catch (err) {
    next(err);
  }
}

// 获得字典数据信息
exports.getDictData = async (req, res, next) => {
  try {
    const dictDataId = req.params.dictDataId
    const dictData = await DictData.findOne({ dictDataId })
    if (!dictData) {
      return res.status(404).end();
    }
    res.status(200).json({
      code: 200,
      msg: '操作成功',
      data: dictData,
    });
  } catch (err) {
    next(err);
  }
}

// 获取字典
exports.getDict = async (req, res, next) => {
  try {
    const dictType = req.params.dictType
    const dictDatas = await DictData.find({ dictType })
      .sort({
        dictSort: 1
      })
    if (!dictDatas) {
      return res.status(404).end();
    }
    res.status(200).json({
      code: 200,
      msg: '操作成功',
      data: dictDatas,
    });
  } catch (err) {
    next(err);
  }
}

// 删除字典数据
exports.deleteDictData = async (req, res, next) => {
  try {
    const dictDataId = req.params.dictDataId
    const dictData = await DictData.findOneAndDelete({ dictDataId })
    if (!dictData) {
      return res.status(404).end();
    }
    res.status(200).json({
      code: 200,
      msg: '操作成功',
      dictData,
    });
  } catch (err) {
    next(err);
  }
}