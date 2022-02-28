const { Article, User, Tag, Topic } = require("../model");
const notion = require('@/util/notion')

/**
 * Init Articles
 * 默认是拉取100条文章信息
 */
exports.initArticles = async (req, res, next) => {
  try {
    const response = await notion.databases.query({
      database_id: process.env.BLOG_DATABASE_ID,
      filter: {
        property: 'isPublished',
        checkbox: {
          equals: true,
        },
      },
      sorts: [
        {
          property: 'publishedTime',
          direction: 'descending',
        },
      ],
    });
    // res.status(200).json({
    //   response
    // })
    const articles = []
    for (const cur of response.results) {
      const properties = cur.properties
      // 处理获取文章数据
      const pageId = cur.id
      const tmp = await Article.findOne({ pageId })
      // 如果在数据中未找到则直接新建
      const article = {
        pageId,
        createdBy: cur.created_by,
        createdTime: cur.created_time,
        lastEditedTime: cur.last_edited_time,
        lastEditedBy: cur.last_edited_by,
        publishedTime: properties.publishedTime.date.start,
        image: properties.image.files[0]?.file.url,
        isPublished: properties.checkbox,
        desc: properties.desc.rich_text[0]?.plain_text,
        tags: properties.tags.multi_select.map(tag => tag.name),
        title: properties.title.title.plain_text,
        topic: properties.topic.select?.name
      }
      // 如果在数据库中找到,则校验文章是否匹配
      if (tmp) {
        
      }

      // 导入标签库
      for (const title of article.tags) {
        const tag = await Tag.findOne({ title })
        if (title && !tag) {
          console.log('导入标签库');
          await new Tag({
            title
          }).save()
        }
      }
      // 导入专题库
      const articleTopic = article.topic
      const topic = await Topic.findOne({ title: articleTopic })
      if (article.topic && !topic) {
        console.log('导入专题库');
        await new Topic({
          title: articleTopic
        }).save()
      }

      await new Article(article).save();
      articles.push(article);
    }
    res.status(201).json({
      msg: '初始化成功！',
      articles
    })
  } catch (error) {
    next(error)
  }
}


// List Articles
exports.listArticles = async (req, res, next) => {
  try {
    // 处理请求

    // 解析数据参数，并设置默认值
    const { limit = 20, offset = 0, tag, author } = req.query;

    // 定义一个过滤对象(查询用的)
    const filter = {};
    if (tag) {
      filter.tagList = tag;
    }
    if (author) {
      const user = await User.findOne({ username: author });
      filter.author = user ? user._id : null;
    }

    const articles = await Article.find(filter)
      .skip(+offset) // 跳过多少条
      .limit(+limit) // 取多少条
      .sort({
        // 排序
        // -1：倒序   1：升序
        createdAt: -1,
      });
    const articlesCont = await Article.countDocuments();
    res.status(200).json({
      articles,
      articlesCont,
    });
    res.send("get /articles/");
  } catch (err) {
    next(err);
  }
};

// Feed Articles
exports.feedArticles = async (req, res, next) => {
  try {
    // 处理请求
    res.send("get /articles/feed");
  } catch (err) {
    next(err);
  }
};

// Get Article
exports.getArticle = async (req, res, next) => {
  try {
    // 处理请求
    const article = await Article.findById(req.params.articleId).populate(
      "author"
    );
    if (!article) {
      return res.status(404).end();
    }
    res.status(200).json({
      article,
    });
  } catch (err) {
    next(err);
  }
};

// Create Article
exports.createArticle = async (req, res, next) => {
  try {
    // 处理请求
    const article = new Article(req.body.article);
    article.author = req.user._id;
    article.populate("author").execPopulate();
    await article.save();
    res.status(201).json({
      article,
    });
  } catch (err) {
    next(err);
  }
};

// Update Article
exports.updateArticle = async (req, res, next) => {
  try {
    const article = req.article;
    const bodyArticle = req.body.article;
    article.title = bodyArticle.title || article.title;
    article.description = bodyArticle.description || article.description;
    article.body = bodyArticle.body || article.body;
    await article.save();
    res.status(200).json({
      article,
    });
  } catch (err) {
    next(err);
  }
};

// Delete Article
exports.deleteArticle = async (req, res, next) => {
  try {
    console.log(req.article);
    const article = req.article;
    await article.remove();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

// Add Comments to an Article
exports.addComments = async (req, res, next) => {
  try {
    // 处理请求
    res.send("post /articles/:slug/comments");
  } catch (err) {
    next(err);
  }
};

// Get Comments from an Article
exports.getComments = async (req, res, next) => {
  try {
    // 处理请求
    res.send("get /articles/:slug/comments");
  } catch (err) {
    next(err);
  }
};

// Delete Comment
exports.deleteComment = async (req, res, next) => {
  try {
    // 处理请求
    res.send("delete /articles/:slug/comments/:id");
  } catch (err) {
    next(err);
  }
};

// Favorite Article
exports.favoriteArticle = async (req, res, next) => {
  try {
    // 处理请求
    res.send("post /articles/:slug/favorite");
  } catch (err) {
    next(err);
  }
};

// Unfavorite Article
exports.unfavoriteArticle = async (req, res, next) => {
  try {
    // 处理请求
    res.send("delete /articles/:slug/favorite");
  } catch (err) {
    next(err);
  }
};
