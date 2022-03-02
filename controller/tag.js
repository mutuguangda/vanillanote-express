const { Tag } = require('@/model')

// list Tags
exports.getTags = async (req, res, next) => {
  try {
    const { limit = 1, offset = 0 } = req.query;
    const tags = await Tag.find({})
      .skip(+offset) // 跳过多少条
      .limit(+limit) // 取多少条
      .sort({
        // 排序
        // -1：倒序   1：升序
        visit: -1,
      });
    res.status(200).json({
      tags
    }) 
  } catch (err) {
    next(err);
  }
}