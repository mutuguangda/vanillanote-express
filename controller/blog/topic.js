const { Topic, Config } = require("@/model");
const notion = require('@/util/notion')
const { getCurrentTime } = require('@/util/common')

// 添加专题
exports.addTopic = async (req, res, next) => {
  try {
    const topic = await new Topic(req.body).save()
    const saveTopic = topic.toJSON();
    // 4. 发送成功响应
    res.status(201).json({
      code: 200,
      msg: '操作成功',
      topic: saveTopic
    });
  } catch (err) {
    next(err);
  }
};

// 更新专题
exports.updateTopic = async (req, res, next) => {
  try {
    const topic = req.body
    await Topic.findOneAndUpdate({ topicId: topic.topicId }, topic)
    res.status(200).json({
      code: 200,
      msg: '操作成功'
    })
  } catch (err) {
    next(err)
  }
};

// 获得专题列表
exports.listTopic = async (req, res, next) => {
  console.log('list topic');
  try {
    // 默认取到 5 个
    const { pageNum, pageSize, topicName, topicKey, status, createdTime } = req.query;
    const filter = {}
    if (topicName) filter.topicName = topicName
    if (topicKey) filter.topicKey = topicKey
    if (status) filter.status = status
    if (createdTime) filter.createdTime = createdTime
    const topics = await Topic.find(filter)
      .skip((pageNum - 1) * pageSize) // 跳过多少条
      .limit(+pageSize) // 取多少条
      .sort({
        topicSort: 1
      })
    // 专题总数
    const topicsCount = await Topic.countDocuments();
    res.status(200).json({
      msg: '成功',
      code: 200,
      rows: topics,
      total: topicsCount,
    });
  } catch (err) {
    next(err);
  }
}

// 获得专题信息
exports.getTopic = async (req, res, next) => {
  try {
    const topicId = req.params.topicId
    const topic = await Topic.findOne({ topicId })
    if (!topic) {
      return res.status(404).end();
    }
    res.status(200).json({
      code: 200,
      msg: '操作成功',
      data: topic,
    });
  } catch (err) {
    next(err);
  }
}

// 删除专题
exports.deleteTopic = async (req, res, next) => {
  try {
    const topicId = req.params.topicId
    const topic = await Topic.findOneAndDelete({ topicId })
    if (!topic) {
      return res.status(404).end();
    }
    res.status(200).json({
      code: 200,
      msg: '操作成功',
      topic,
    });
  } catch (err) {
    next(err);
  }
}

// 同步专题
exports.syncTopic = async (req, res, next) => {
  try {
    // 获得上次专题更新时间
    const config = await Config.findOne({ configKey: 'blog.topic.syncTime' })
    const syncTime = config.configValue
    const topicResponse = await notion.databases.query({
      database_id: process.env.TOPIC_DATABASE_ID,
      filter: {
        and: [
          // {
          //   property: 'isPublished',
          //   checkbox: {
          //     equals: true,
          //   },
          // },
          {
            property: 'lastEditedTime',
            last_edited_time: {
              after: syncTime
            }
          }
        ]
      },
    });
    for (const cur of topicResponse.results) {
      const properties = cur.properties
      const pageId = cur.id
      // 处理获取专题数据
      const topic = {
        pageId: pageId,
        title: properties.title?.title[0]?.plain_text,
        // createdBy: properties.createdBy.created_by,
        createdTime: cur.created_time,
        lastEditedTime: cur.last_edited_time,
        // lastEditedBy: properties.lastEditedBy.last_edited_by,
        articles: properties.articles?.relation,
        articlesNum: properties.articlesNum?.formula?.number,
        visit: properties.visit?.number,
      }
      // 同步Notion数据到服务端数据库
      await new Topic(topic).save()
    }
    await Config.findOneAndUpdate({ configKey: 'blog.topic.syncTime' }, {
      configValue: getCurrentTime()
    })
    return res.status(200).json({
      code: 200,
      msg: '同步成功！',
    })
  } catch (err) {
    next(err);
  }
}