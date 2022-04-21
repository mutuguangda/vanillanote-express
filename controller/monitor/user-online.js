const { UserOnline } = require("@/model");
const UAParser = require("ua-parser-js");

// 获得在线用户列表
exports.listUserOnline = async (req, res, next) => {
  try {
    // 默认取到 5 个
    const { pageNum, pageSize, userOnlineName, userOnlineKey, status, createdTime } = req.query;
    const filter = {}
    if (userOnlineName) filter.userOnlineName = userOnlineName
    if (userOnlineKey) filter.userOnlineKey = userOnlineKey
    if (status) filter.status = status
    if (createdTime) filter.createdTime = createdTime
    const userOnlines = await UserOnline.find(filter)
      .skip((pageNum - 1) * pageSize) // 跳过多少条
      .limit(+pageSize) // 取多少条
      .sort({
        userOnlineSort: 1
      })
    // 在线用户总数
    const userOnlinesCount = await UserOnline.countDocuments();
    res.status(200).json({
      msg: '成功',
      code: 200,
      rows: userOnlines,
      total: userOnlinesCount,
    });
  } catch (err) {
    next(err);
  }
}

// 删除在线用户
exports.deleteUserOnline = async (req, res, next) => {
  try {
    const userOnlineId = req.params.userOnlineId
    const userOnline = await UserOnline.findByIdAndDelete(userOnlineId)
    if (!userOnline) {
      return res.status(404).end();
    }
    res.status(200).json({
      code: 200,
      msg: '操作成功',
      userOnline,
    });
  } catch (err) {
    next(err);
  }
}