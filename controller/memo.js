const { Memo } = require('@/model')
const notion = require('@/util/notion')

// list memos
exports.listMemo = async (req, res, next) => {
  try {
    // 默认取到 5 个
    const { pageNum, pageSize } = req.query;
    const memos = await Memo.find({})
      .skip((pageNum - 1) * pageSize) // 跳过多少条
      .limit(+pageSize) // 取多少条
      .sort({
        // 排序
        // -1：倒序   1：升序
        visit: -1,
      });
    const memosCount = await Memo.countDocuments();
    res.status(200).json({
      msg: '成功',
      code: 200, 
      rows: memos,
      total: memosCount,
    });
  } catch (err) {
    next(err);
  }
}

exports.syncMemo = async (req, res, next) => {
  try {
    const syncTime = ''
    console.log(process.env.MEMO_DATABASE_ID);
    const memoResponse = await notion.databases.query({
      database_id: process.env.MEMO_DATABASE_ID,
      filter: {
        and: [
          // {
          //   property: 'isPublished',
          //   checkbox: {
          //     equals: true,
          //   },
          // },
          // {
          //   property: 'lastEditedTime',
          //   last_edited_time: {
          //     after: syncTime || '1970-01-01T00:00:00.000Z'
          //   }
          // }
        ]
      },
    });
    console.log('> memoResponse', memoResponse.results.length);
    for (const cur of memoResponse.results) {
      const properties = cur.properties
      const pageId = cur.id
      const memo = {
        pageId: pageId,
        title: properties.title?.title[0]?.plain_text,
        archive: properties.archive?.select?.name,
        isFinished: properties.isFinished.checkbox,
        tags: properties.tags.multi_select.map(tag => tag.name),
        remark: properties.remark.rich_text[0]?.plain_text,
        createdTime: cur.created_time,
      }
      await new Memo(memo).save()
    }
    return res.status(200).json({
      code: 200,
      msg: '同步成功！'
    })
  } catch (error) {
    next(error)
  }
}