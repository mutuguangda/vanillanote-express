const { Topic } = require('@/model')

// list topics
exports.getTopics = async (req, res, next) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const topics = await Topic.find({})
      .skip(+offset) // 跳过多少条
      .limit(+limit) // 取多少条
      .sort({
        // 排序
        // -1：倒序   1：升序
        visit: -1,
      });
    res.status(200).json({
      topics
    })
  } catch (err) {
    next(err);
  }
}