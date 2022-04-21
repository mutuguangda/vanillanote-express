const { Tag } = require("@/model");
const notion = require('@/util/notion')
const { getCurrentTime } = require('@/util/common')

// 添加标签
exports.addTag = async (req, res, next) => {
  try {
    const tag = await new Tag(req.body).save()
    const saveTag = tag.toJSON();
    // 4. 发送成功响应
    res.status(201).json({
      code: 200,
      msg: '操作成功',
      tag: saveTag
    });
  } catch (err) {
    next(err);
  }
};

// 更新标签
exports.updateTag = async (req, res, next) => {
  try {
    const tag = req.body
    await Tag.findOneAndUpdate({ tagId: tag.tagId }, tag)
    res.status(200).json({
      code: 200,
      msg: '操作成功'
    })
  } catch (err) {
    next(err)
  }
};

// 获得标签列表
exports.listTag = async (req, res, next) => {
  console.log('list tag');
  try {
    // 默认取到 5 个
    const { pageNum, pageSize, tagName, tagKey, status, createdTime } = req.query;
    const filter = {}
    if (tagName) filter.tagName = tagName
    if (tagKey) filter.tagKey = tagKey
    if (status) filter.status = status
    if (createdTime) filter.createdTime = createdTime
    const tags = await Tag.find(filter)
      .skip((pageNum - 1) * pageSize) // 跳过多少条
      .limit(+pageSize) // 取多少条
      .sort({
        tagSort: 1
      })
    // 标签总数
    const tagsCount = await Tag.countDocuments();
    res.status(200).json({
      msg: '成功',
      code: 200,
      rows: tags,
      total: tagsCount,
    });
  } catch (err) {
    next(err);
  }
}

// 获得标签信息
exports.getTag = async (req, res, next) => {
  try {
    const tagId = req.params.tagId
    const tag = await Tag.findOne({ tagId })
    if (!tag) {
      return res.status(404).end();
    }
    res.status(200).json({
      code: 200,
      msg: '操作成功',
      data: tag,
    });
  } catch (err) {
    next(err);
  }
}

// 获得标签值
exports.getTagByKey = async (req, res, next) => {
  try {
    const tagKey = req.params.tagKey
    const tag = await Tag.findOne({ tagKey })
    if (!tag) {
      return res.status(404).end();
    }
    res.status(200).json({
      code: 200,
      msg: tag.tagValue,
    });
  } catch (err) {
    next(err);
  }
}

// 删除标签
exports.deleteTag = async (req, res, next) => {
  try {
    const tagId = req.params.tagId
    const tag = await Tag.findOneAndDelete({ tagId })
    if (!tag) {
      return res.status(404).end();
    }
    res.status(200).json({
      code: 200,
      msg: '操作成功',
      tag,
    });
  } catch (err) {
    next(err);
  }
}

// 同步标签
exports.syncTag = async (req, res, next) => {
  try {
    // 获得上次标签更新时间
    const config = await Config.findOne({ configKey: 'blog.tag.syncTime' })
    const syncTime = config.configValue
    const tagResponse = await notion.databases.query({
      database_id: process.env.ARTICLE_DATABASE_ID,
      filter: {
        and: [
          {
            property: 'isPublished',
            checkbox: {
              equals: true,
            },
          },
          {
            property: 'lastEditedTime',
            last_edited_time: {
              after: syncTime
            }
          }
        ]
      },
    });
    for (const cur of tagResponse.results) {
      const properties = cur.properties
      const pageId = cur.id
      // 处理获取标签数据
      const tag = {
        pageId: pageId,
        title: properties.title?.title[0]?.plain_text,
        createdBy: properties.createdBy.created_by,
        createdTime: cur.created_time,
        lastEditedTime: cur.last_edited_time,
        lastEditedBy: properties.lastEditedBy.last_edited_by,
        publishedTime: properties.publishedTime?.date?.start,
        image: properties.image?.files[0]?.file.url,
        isPublished: properties.isPublished.checkbox,
        desc: properties.desc?.rich_text[0]?.plain_text,
        tags: properties.tags.multi_select.map(tag => tag.name),
        topic: properties.topic.relation,
      }
      // 同步Notion数据到服务端数据库
      await new Tag(tag).save()
      // 修改Notion-Tag数据库
      for (const tagTitle of tag.tags) {
        // 查找tag数据库是否存在该tag
        const tagQueryResponse = await notion.databases.query({
          database_id: process.env.TAG_DATABASE_ID,
          filter: {
            property: 'title',
            title: {
              equals: tagTitle
            }
          }
        })
        let tagCreateOrUpdateResponse = null
        if (tagQueryResponse.results.length === 0) {
          // 未找到tag数据,创建新的条例存入
          tagCreateOrUpdateResponse = await notion.pages.create({
            parent: {
              database_id: process.env.TAG_DATABASE_ID,
            },
            properties: {
              "title": {
                "title": [
                  {
                    "type": "text",
                    "text": {
                      "content": tagTitle
                    }
                  }
                ]
              },
              tagsNum: {
                "number": 1
              },
              visit: {
                number: 0
              }
            }
          })
        } else {
          // 反之，是找到tag数据
          const tagPageId = tagQueryResponse.results[0].id
          const tagsNum = tagQueryResponse.results[0].properties.tagsNum.number
          tagCreateOrUpdateResponse = await notion.pages.update({
            page_id: tagPageId,
            properties: {
              'tagsNum': {
                "number": tagsNum + 1
              }
            },
          });
        }
        const tagProperties = tagCreateOrUpdateResponse.properties
        const tag = {
          title: tagProperties.title?.title[0]?.plain_text,
          visit: tagProperties.visit.number,
          tagsNum: tagProperties.tagsNum.number,
          createdTime: tagCreateOrUpdateResponse.created_time,
          lastEditedTime: tagCreateOrUpdateResponse.last_edited_time,
        }
        await new Tag(tag).save()
        // 导入专题库
        // const tagTopic = tag.topic
        // const topic = await Topic.findOne({ title: tagTopic })
        // if (tag.topic && !topic) {
        //   console.log('导入专题库');
        //   await new Topic({
        //     title: tagTopic
        //   }).save()
        // }

        // if (!tmp) await new Tag(tag).save();
        // tags.push(tag);
      }
      // 修改Notion-Topic数据库
      // const topicTitle = tag.topic
      // const topicQueryResponse = await notion.databases.query({
      //   database_id: process.env.TOPIC_DATABASE_ID,
      //   filter: {
      //     property: 'title',
      //     title: {
      //       equals: topicTitle
      //     }
      //   }
      // })
      // if (topicQueryResponse.results.length === 0) {
      //   // 未找到topic数据,创建新的条例存入
      //   const topicCreateResponse = await notion.pages.create({
      //     parent: {
      //       database_id: process.env.TOPIC_DATABASE_ID,
      //     },
      //     properties: {
      //       "title": {
      //         "title": [
      //           {
      //             "type": "text",
      //             "text": {
      //               "content": topicTitle
      //             }
      //           }
      //         ]
      //       },
      //       tagsNum: {
      //         "number": 1
      //       },
      //       tags: {
      //         relation: [
      //           {
      //             id: pageId
      //           }
      //         ]
      //       }
      //     }
      //   })
      // } else {
      //   // 反之，是找到topic数据
      //   const topicPageId = topicQueryResponse.results[0].id
      //   const tagsNum = topicQueryResponse.results[0].properties.tagsNum.number
      //   const tags = topicQueryResponse.results[0].properties.tags.relation
      //   const topicUpdateResponse = await notion.pages.update({
      //     page_id: topicPageId,
      //     properties: {
      //       'tagsNum': {
      //         "number": tagsNum + 1
      //       },
      //       tags: {
      //         relation: tags.push(pageId)
      //       }
      //     },
      //   });
      // }
    }
    await Config.findOneAndUpdate({ configKey: 'blog.tag.syncTime' }, {
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