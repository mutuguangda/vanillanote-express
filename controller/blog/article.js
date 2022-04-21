const { Article, User, Tag, Topic, Comment, Config } = require("@/model");
const notion = require('@/util/notion')
const { getCurrentTime } = require('@/util/common')

// 添加文章
exports.addArticle = async (req, res, next) => {
  try {
    const article = await new Article(req.body).save()
    const saveArticle = article.toJSON();
    // 4. 发送成功响应
    res.status(201).json({
      code: 200,
      msg: '操作成功',
      article: saveArticle
    });
  } catch (err) {
    next(err);
  }
};

// 更新文章
exports.updateArticle = async (req, res, next) => {
  try {
    const article = req.body
    await Article.findOneAndUpdate({ articleId: article.articleId }, article)
    res.status(200).json({
      code: 200,
      msg: '操作成功'
    })
  } catch (err) {
    next(err)
  }
};

// 获得文章列表
exports.listArticle = async (req, res, next) => {
  try {
    // 默认取到 5 个
    const { pageNum, pageSize, tag, topic, isPublished, createdTime } = req.query;
    const filter = {}
    if (tag) filter.tag = tag
    if (topic) filter.topic = topic
    if (isPublished) filter.isPublished = isPublished
    if (createdTime) filter.createdTime = createdTime
    const articles = await Article.find(filter)
      .skip((pageNum - 1) * pageSize) // 跳过多少条
      .limit(+pageSize) // 取多少条
      .sort({
        articleSort: 1
      })
    // 文章总数
    const articlesCount = await Article.countDocuments();
    res.status(200).json({
      msg: '操作成功',
      code: 200,
      rows: articles,
      total: articlesCount,
    });
  } catch (err) {
    next(err);
  }
}

// 获得文章信息
exports.getArticle = async (req, res, next) => {
  try {
    const articleId = req.params.articleId
    const article = await Article.findOne({ articleId })
    if (!article) {
      return res.status(404).end();
    }
    res.status(200).json({
      code: 200,
      msg: '操作成功',
      data: article,
    });
  } catch (err) {
    next(err);
  }
}

// 删除文章
exports.deleteArticle = async (req, res, next) => {
  try {
    const articleId = req.params.articleId
    console.log(articleId);
    const article = await Article.findOneAndDelete({ articleId })
    if (!article) {
      return res.status(404).end();
    }
    res.status(200).json({
      code: 200,
      msg: '操作成功',
      article,
    });
  } catch (err) {
    next(err);
  }
}

// 同步文章
exports.syncArticle_20220421 = async (req, res, next) => {
  try {
    // 获得上次文章更新时间
    const config = await Config.findOne({ configKey: 'blog.article.syncTime' })
    const syncTime = config.configValue
    // 获得Notion文章列表
    const articleResponse = await notion.databases.query({
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
    // 处理文章数据
    for (const cur of articleResponse.results) {
      const properties = cur.properties
      const pageId = cur.id
      // 处理获取文章数据
      const article = {
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
        cover: cur.cover.external.url
      }
      // 同步Notion数据到服务端数据库
      await new Article(article).save()
      // 修改Notion-Tag数据库
      for (const tagTitle of article.tags) {
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
              articlesNum: {
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
          const articlesNum = tagQueryResponse.results[0].properties.articlesNum.number
          tagCreateOrUpdateResponse = await notion.pages.update({
            page_id: tagPageId,
            properties: {
              'articlesNum': {
                "number": articlesNum + 1
              }
            },
          });
        }
        const tagProperties = tagCreateOrUpdateResponse.properties
        const tag = {
          title: tagProperties.title?.title[0]?.plain_text,
          visit: tagProperties.visit.number,
          articlesNum: tagProperties.articlesNum.number,
          createdTime: tagCreateOrUpdateResponse.created_time,
          lastEditedTime: tagCreateOrUpdateResponse.last_edited_time,
        }
        await new Tag(tag).save()
        // 导入专题库
        // const articleTopic = article.topic
        // const topic = await Topic.findOne({ title: articleTopic })
        // if (article.topic && !topic) {
        //   console.log('导入专题库');
        //   await new Topic({
        //     title: articleTopic
        //   }).save()
        // }

        // if (!tmp) await new Article(article).save();
        // articles.push(article);
      }
      // 修改Notion-Topic数据库
      // const topicTitle = article.topic
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
      //       articlesNum: {
      //         "number": 1
      //       },
      //       articles: {
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
      //   const articlesNum = topicQueryResponse.results[0].properties.articlesNum.number
      //   const articles = topicQueryResponse.results[0].properties.articles.relation
      //   const topicUpdateResponse = await notion.pages.update({
      //     page_id: topicPageId,
      //     properties: {
      //       'articlesNum': {
      //         "number": articlesNum + 1
      //       },
      //       articles: {
      //         relation: articles.push(pageId)
      //       }
      //     },
      //   });
      // }
    }
    // 修改更新时间
    await Config.findOneAndUpdate({ configKey: 'blog.article.syncTime' }, {
      configValue: getCurrentTime()
    })
    return res.status(200).json({
      code: 200,
      msg: '操作成功',
    })
  } catch (err) {
    next(err);
  }
}

// 同步文章
exports.syncArticle = async (req, res, next) => {
  try {
    // 获得上次文章更新时间
    const config = await Config.findOne({ configKey: 'blog.article.syncTime' })
    const syncTime = config.configValue
    // 获得Notion文章列表
    const articleResponse = await notion.databases.query({
      database_id: process.env.ARTICLE_DATABASE_ID,
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
    // console.log(articleResponse);
    if (articleResponse.results.length === 0) {
      res.status(200).json({
        code: 200,
        msg: 'Notion已无文章数据需要同步'
      })
    }
    console.log('articleResponse', articleResponse);
    // 处理文章数据
    for (const cur of articleResponse.results) {
      const properties = cur.properties
      const pageId = cur.id
      // 如果创建时间大于同步时间则是新增数据，反之则是修改数据
      const isCreated = cur.created_time > syncTime ? true : false
      // 处理获取文章数据
      const tags = properties.tags.multi_select
      const topic = properties.topic.select
      const article = {
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
        tags: tags.map(tag => tag.name),
        topic: topic.name,
        cover: cur.cover.external.url
      }
      // 同步Notion数据到服务端数据库
      await new Article(article).save()
      for (const tag of tags) {
        await Tag.findOneAndUpdate({ tagName: tag.name }, {
          tagColor: tag.color,
          $inc: { articlesNum: Number(isCreated) }
        }, { upsert: true })
      }
      await Topic.findOneAndUpdate({ topicName: topic.name }, {
        topicColor: topic.color,
        $inc: { articlesNum: Number(isCreated) }
      }, { upsert: true })
    }
    // 修改更新时间
    await Config.findOneAndUpdate({ configKey: 'blog.article.syncTime' }, {
      configValue: getCurrentTime()
    })
    return res.status(200).json({
      code: 200,
      msg: '操作成功',
    })
  } catch (err) {
    next(err);
  }
}

// 强制同步文章
exports.forcedSyncArticle = async (req, res, next) => {
  try {
    await Article.deleteMany()
    const articleResponse = await notion.databases.query({
      database_id: process.env.ARTICLE_DATABASE_ID,
      filter: {
        and: [
          {
            property: 'isPublished',
            checkbox: {
              equals: true,
            },
          },
        ]
      },
    });
    for (const cur of articleResponse.results) {
      const properties = cur.properties
      const pageId = cur.id
      // 处理获取文章数据
      const article = {
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
        // tags: properties.tags.multi_select.map(tag => tag.name),
        tags: properties.tags.multi_select,
        topic: properties.topic.relation,
      }
      // 同步Notion数据到服务端数据库
      await new Article(article).save()
      // 修改Notion-Tag数据库
      for (const tagsItem of article.tags) {
        const tagTitle = tagsItem.name
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
              articlesNum: {
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
          const articlesNum = tagQueryResponse.results[0].properties.articlesNum.number
          tagCreateOrUpdateResponse = await notion.pages.update({
            page_id: tagPageId,
            properties: {
              'articlesNum': {
                "number": articlesNum + 1
              }
            },
          });
        }
        const tagProperties = tagCreateOrUpdateResponse.properties
        const tag = {
          title: tagProperties.title?.title[0]?.plain_text,
          visit: tagProperties.visit.number,
          articlesNum: tagProperties.articlesNum.number,
          createdTime: tagCreateOrUpdateResponse.created_time,
          lastEditedTime: tagCreateOrUpdateResponse.last_edited_time,
        }
        await Tag.findOneAndUpdate({ title: tag.title }, tag, { upsert: true })
        // 导入专题库
        // const articleTopic = article.topic
        // const topic = await Topic.findOne({ title: articleTopic })
        // if (article.topic && !topic) {
        //   console.log('导入专题库');
        //   await new Topic({
        //     title: articleTopic
        //   }).save()
        // }

        // if (!tmp) await new Article(article).save();
        // articles.push(article);
      }
      // 修改Notion-Topic数据库
      // const topicTitle = article.topic
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
      //       articlesNum: {
      //         "number": 1
      //       },
      //       articles: {
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
      //   const articlesNum = topicQueryResponse.results[0].properties.articlesNum.number
      //   const articles = topicQueryResponse.results[0].properties.articles.relation
      //   const topicUpdateResponse = await notion.pages.update({
      //     page_id: topicPageId,
      //     properties: {
      //       'articlesNum': {
      //         "number": articlesNum + 1
      //       },
      //       articles: {
      //         relation: articles.push(pageId)
      //       }
      //     },
      //   });
      // }
    }
    await Config.findOneAndUpdate({ configKey: 'blog.article.syncTime' }, {
      configValue: getCurrentTime()
    })
    return res.status(200).json({
      code: 200,
      msg: '操作成功',
    })
  } catch (err) {
    next(err);
  }
}