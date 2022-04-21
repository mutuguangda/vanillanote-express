const { Comment, Config } = require("@/model");
const notion = require('@/util/notion')
const { getCurrentTime } = require('@/util/common')

// 添加评论
exports.addComment = async (req, res, next) => {
  try {
    const comment = await new Comment(req.body).save()
    const saveComment = comment.toJSON();
    // 4. 发送成功响应
    res.status(201).json({
      code: 200,
      msg: '操作成功',
      comment: saveComment
    });
  } catch (err) {
    next(err);
  }
};

// 更新评论
exports.updateComment = async (req, res, next) => {
  try {
    const comment = req.body
    await Comment.findOneAndUpdate({ commentId: comment.commentId }, comment)
    res.status(200).json({
      code: 200,
      msg: '操作成功'
    })
  } catch (err) {
    next(err)
  }
};

// 获得评论列表
exports.listComment = async (req, res, next) => {
  try {
    // 默认取到 5 个
    const { pageNum, pageSize, commentName, commentKey, status, createdTime } = req.query;
    const filter = {}
    if (commentName) filter.commentName = commentName
    if (commentKey) filter.commentKey = commentKey
    if (status) filter.status = status
    if (createdTime) filter.createdTime = createdTime
    const comments = await Comment.find(filter)
      .skip((pageNum - 1) * pageSize) // 跳过多少条
      .limit(+pageSize) // 取多少条
      .sort({
        commentSort: 1
      })
    // 评论总数
    const commentsCount = await Comment.countDocuments();
    res.status(200).json({
      msg: '成功',
      code: 200,
      rows: comments,
      total: commentsCount,
    });
  } catch (err) {
    next(err);
  }
}

// 获得评论列表（博客渲染）
exports.listCommentForBlog = async (req, res, next) => {
  try {
    // 默认取到 5 个
    // const { pageNum, pageSize, commentName, commentKey, status, createdTime } = req.query;
    // const filter = {}
    // if (commentName) filter.commentName = commentName
    // if (commentKey) filter.commentKey = commentKey
    // if (status) filter.status = status
    // if (createdTime) filter.createdTime = createdTime
    const totalComment = []
    const { articleId } = req.query
    // 这是一级评论
    const comments = await Comment.find({ articleId, parentId: 0 })
      .sort({
        createdTime: 1
      })
    console.log(comments);
    for (const comment of comments) {
      const secondCommets = await Comment.find({ parentId: comment.commentId })
      comment.children = secondCommets
      totalComment.push(comment)
    }
    res.status(200).json({
      msg: '成功',
      code: 200,
      rows: totalComment,
    });
  } catch (err) {
    next(err);
  }
}

// 获得评论信息
exports.getComment = async (req, res, next) => {
  try {
    const commentId = req.params.commentId
    const comment = await Comment.findOne({ commentId })
    if (!comment) {
      return res.status(404).end();
    }
    res.status(200).json({
      code: 200,
      msg: '操作成功',
      data: comment,
    });
  } catch (err) {
    next(err);
  }
}

// 删除评论
exports.deleteComment = async (req, res, next) => {
  try {
    const commentId = req.params.commentId
    const comment = await Comment.findOneAndDelete({ commentId })
    if (!comment) {
      return res.status(404).end();
    }
    res.status(200).json({
      code: 200,
      msg: '操作成功',
      comment,
    });
  } catch (err) {
    next(err);
  }
}

// 同步评论
exports.syncComment = async (req, res, next) => {
  try {
    // 获得上次评论更新时间
    const config = await Config.findOne({ configKey: 'blog.comment.syncTime' })
    const syncTime = config.configValue
    const commentResponse = await notion.databases.query({
      database_id: process.env.COMMENT_DATABASE_ID,
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
    for (const cur of commentResponse.results) {
      const properties = cur.properties
      const pageId = cur.id
      // 处理获取评论数据
      const comment = {
        pageId: pageId,
        article: properties.article.relation,
        avatar: properties.avatar.select,
        content: properties.content?.title[0]?.plain_text,
        name: properties.name.rich_text[0]?.plain_text,
        email: properties.email.email,
        comment: properties.comment.relation,
        reply: properties.reply.relation,
        createdTime: cur.created_time,
        lastEditedTime: cur.last_edited_time,
      }
      // 同步Notion数据到服务端数据库
      await new Comment(comment).save()
    }
    await Config.findOneAndUpdate({ configKey: 'blog.comment.syncTime' }, {
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

// 强制同步评论
exports.forcedSyncComment = async (req, res, next) => {
  try {
    console.log('你好');
    await Comment.deleteMany()
    // 获得上次评论更新时间
    const commentResponse = await notion.databases.query({
      database_id: process.env.COMMENT_DATABASE_ID,
    });
    console.log(commentResponse);
    for (const cur of commentResponse.results) {
      const properties = cur.properties
      const pageId = cur.id
      // 处理获取评论数据
      const comment = {
        pageId: pageId,
        article: properties.article.relation,
        avatar: properties.avatar.select,
        content: properties.content?.title[0]?.plain_text,
        name: properties.name.rich_text[0]?.plain_text,
        email: properties.email.email,
        comment: properties.comment.relation,
        reply: properties.reply.relation,
        createdTime: cur.created_time,
        lastEditedTime: cur.last_edited_time,
      }
      // 同步Notion数据到服务端数据库
      await new Comment(comment).save()
    }
    await Config.findOneAndUpdate({ configKey: 'blog.comment.syncTime' }, {
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