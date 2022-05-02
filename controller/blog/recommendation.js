const { Recommendation } = require("@/model");
const notion = require('@/util/notion')
const { getCurrentTime } = require('@/util/common')

// 添加推荐
exports.addRecommendation = async (req, res, next) => {
  try {
    const body = req.body 
    if (body.article) body.url = `/post/${body.article.articleId}`
    const recommendation = await new Recommendation(body).save()
    const saveRecommendation = recommendation.toJSON();
    // 4. 发送成功响应
    res.status(201).json({
      code: 200,
      msg: '操作成功',
      recommendation: saveRecommendation
    });
  } catch (err) {
    next(err);
  }
};

// 更新推荐
exports.updateRecommendation = async (req, res, next) => {
  try {
    const recommendation = req.body
    if (recommendation.article) recommendation.url = `/post/${recommendation.article.articleId}`
    await Recommendation.findByIdAndUpdate(recommendation._id, recommendation)
    res.status(200).json({
      code: 200,
      msg: '操作成功'
    })
  } catch (err) {
    next(err)
  }
};

// 获得推荐列表
exports.listRecommendation = async (req, res, next) => {
  console.log('list recommendation');
  try {
    // 默认取到 5 个
    const { pageNum, pageSize, recommendationName, recommendationKey, status, createdTime } = req.query;
    const filter = {}
    if (recommendationName) filter.recommendationName = recommendationName
    if (recommendationKey) filter.recommendationKey = recommendationKey
    if (status) filter.status = status
    if (createdTime) filter.createdTime = createdTime
    const recommendations = await Recommendation.find(filter)
      .skip((pageNum - 1) * pageSize) // 跳过多少条
      .limit(+pageSize) // 取多少条
      .sort({
        recommendationSort: 1
      })
    // 推荐总数
    const recommendationsCount = await Recommendation.countDocuments();
    res.status(200).json({
      msg: '成功',
      code: 200,
      rows: recommendations,
      total: recommendationsCount,
    });
  } catch (err) {
    next(err);
  }
}

// 获得推荐信息
exports.getRecommendation = async (req, res, next) => {
  try {
    const recommendationId = req.params.recommendationId
    const recommendation = await Recommendation.findById(recommendationId)
    if (!recommendation) {
      return res.status(404).end();
    }
    res.status(200).json({
      code: 200,
      msg: '操作成功',
      data: recommendation,
    });
  } catch (err) {
    next(err);
  }
}

// 获得推荐值
exports.getRecommendationByKey = async (req, res, next) => {
  try {
    const recommendationKey = req.params.recommendationKey
    const recommendation = await Recommendation.findOne({ recommendationKey })
    if (!recommendation) {
      return res.status(404).end();
    }
    res.status(200).json({
      code: 200,
      msg: recommendation.recommendationValue,
    });
  } catch (err) {
    next(err);
  }
}

// 删除推荐
exports.deleteRecommendation = async (req, res, next) => {
  try {
    const recommendationId = req.params.recommendationId
    const recommendation = await Recommendation.findOneAndDelete({ recommendationId })
    if (!recommendation) {
      return res.status(404).end();
    }
    res.status(200).json({
      code: 200,
      msg: '操作成功',
      recommendation,
    });
  } catch (err) {
    next(err);
  }
}

// 同步推荐
exports.syncRecommendation = async (req, res, next) => {
  try {
    // 获得上次推荐更新时间
    const config = await Config.findOne({ configKey: 'blog.recommendation.syncTime' })
    const syncTime = config.configValue
    const recommendationResponse = await notion.databases.query({
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
    for (const cur of recommendationResponse.results) {
      const properties = cur.properties
      const pageId = cur.id
      // 处理获取推荐数据
      const recommendation = {
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
        recommendations: properties.recommendations.multi_select.map(recommendation => recommendation.name),
        recommendation: properties.recommendation.relation,
      }
      // 同步Notion数据到服务端数据库
      await new Recommendation(recommendation).save()
      // 修改Notion-Recommendation数据库
      for (const recommendationTitle of recommendation.recommendations) {
        // 查找recommendation数据库是否存在该recommendation
        const recommendationQueryResponse = await notion.databases.query({
          database_id: process.env.TAG_DATABASE_ID,
          filter: {
            property: 'title',
            title: {
              equals: recommendationTitle
            }
          }
        })
        let recommendationCreateOrUpdateResponse = null
        if (recommendationQueryResponse.results.length === 0) {
          // 未找到recommendation数据,创建新的条例存入
          recommendationCreateOrUpdateResponse = await notion.pages.create({
            parent: {
              database_id: process.env.TAG_DATABASE_ID,
            },
            properties: {
              "title": {
                "title": [
                  {
                    "type": "text",
                    "text": {
                      "content": recommendationTitle
                    }
                  }
                ]
              },
              recommendationsNum: {
                "number": 1
              },
              visit: {
                number: 0
              }
            }
          })
        } else {
          // 反之，是找到recommendation数据
          const recommendationPageId = recommendationQueryResponse.results[0].id
          const recommendationsNum = recommendationQueryResponse.results[0].properties.recommendationsNum.number
          recommendationCreateOrUpdateResponse = await notion.pages.update({
            page_id: recommendationPageId,
            properties: {
              'recommendationsNum': {
                "number": recommendationsNum + 1
              }
            },
          });
        }
        const recommendationProperties = recommendationCreateOrUpdateResponse.properties
        const recommendation = {
          title: recommendationProperties.title?.title[0]?.plain_text,
          visit: recommendationProperties.visit.number,
          recommendationsNum: recommendationProperties.recommendationsNum.number,
          createdTime: recommendationCreateOrUpdateResponse.created_time,
          lastEditedTime: recommendationCreateOrUpdateResponse.last_edited_time,
        }
        await new Recommendation(recommendation).save()
        // 导入推荐库
        // const recommendationRecommendation = recommendation.recommendation
        // const recommendation = await Recommendation.findOne({ title: recommendationRecommendation })
        // if (recommendation.recommendation && !recommendation) {
        //   console.log('导入推荐库');
        //   await new Recommendation({
        //     title: recommendationRecommendation
        //   }).save()
        // }

        // if (!tmp) await new Recommendation(recommendation).save();
        // recommendations.push(recommendation);
      }
      // 修改Notion-Recommendation数据库
      // const recommendationTitle = recommendation.recommendation
      // const recommendationQueryResponse = await notion.databases.query({
      //   database_id: process.env.TOPIC_DATABASE_ID,
      //   filter: {
      //     property: 'title',
      //     title: {
      //       equals: recommendationTitle
      //     }
      //   }
      // })
      // if (recommendationQueryResponse.results.length === 0) {
      //   // 未找到recommendation数据,创建新的条例存入
      //   const recommendationCreateResponse = await notion.pages.create({
      //     parent: {
      //       database_id: process.env.TOPIC_DATABASE_ID,
      //     },
      //     properties: {
      //       "title": {
      //         "title": [
      //           {
      //             "type": "text",
      //             "text": {
      //               "content": recommendationTitle
      //             }
      //           }
      //         ]
      //       },
      //       recommendationsNum: {
      //         "number": 1
      //       },
      //       recommendations: {
      //         relation: [
      //           {
      //             id: pageId
      //           }
      //         ]
      //       }
      //     }
      //   })
      // } else {
      //   // 反之，是找到recommendation数据
      //   const recommendationPageId = recommendationQueryResponse.results[0].id
      //   const recommendationsNum = recommendationQueryResponse.results[0].properties.recommendationsNum.number
      //   const recommendations = recommendationQueryResponse.results[0].properties.recommendations.relation
      //   const recommendationUpdateResponse = await notion.pages.update({
      //     page_id: recommendationPageId,
      //     properties: {
      //       'recommendationsNum': {
      //         "number": recommendationsNum + 1
      //       },
      //       recommendations: {
      //         relation: recommendations.push(pageId)
      //       }
      //     },
      //   });
      // }
    }
    await Config.findOneAndUpdate({ configKey: 'blog.recommendation.syncTime' }, {
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