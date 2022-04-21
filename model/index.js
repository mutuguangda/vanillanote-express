const mongoose = require("mongoose");
const dbURI = process.env.DB_URI
const { modelSaveWithIdIncrement } = require('@/util/common')

// 连接 MongoDB 数据库
mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
// 当连接失败的时候
db.on("error", (err) => {
  console.log("MongoDB 数据库连接失败！", err);
});
// 当连接成功的时候
db.once("open", function () {
  console.log("MongoDB 数据库连接成功！");
});


// const UserLog = mongoose.model('UserLog', require('./user-log'))
const UserOnline = mongoose.model('UserOnline', require('./monitor/user-online'))
const Tag = mongoose.model('Tag', require('./blog/tag'))
const Topic = mongoose.model('Topic', require('./blog/topic'))
const Site = mongoose.model('Site', require('./site/site'))
// const Setting = mongoose.model('Setting', require('./setting'))
const Memo = mongoose.model('Memo', require('./notion/memo'))
const Seq = mongoose.model('Seq', require('./common/seq'))
const Recommendation = mongoose.model('Recommendation', require('.//blog/recommendation'))

const userSchema = require('./system/user')
const roleSchema = require('./system/role');
const menuSchema = require("./system/menu");
const dictTypeSchema = require('./system/dict-type')
const dictDataSchema = require('./system/dict-data')
const configSchema = require('./system/config')
const articleSchema = require('./blog/article');
const commentSchema = require("./blog/comment");

preSaveWithIdIncrement(userSchema, 'user', Seq)
preSaveWithIdIncrement(roleSchema, 'role', Seq)
preSaveWithIdIncrement(menuSchema, 'menu', Seq)
preSaveWithIdIncrement(dictTypeSchema, 'dictType', Seq)
preSaveWithIdIncrement(dictDataSchema, 'dictData', Seq)
preSaveWithIdIncrement(configSchema, 'config', Seq)
preSaveWithIdIncrement(articleSchema, 'article', Seq)
preSaveWithIdIncrement(commentSchema, 'comment', Seq)
// userSchema.pre('save', function (next) {
//   const that = this
//   Seq.findOneAndUpdate({ _id: 'user' }, { $inc: { userSeq: 1 } }, { new: true, upsert: true }, function (error, seqItem) {
//     if (error) {
//       return next(error)
//     }
//     that.seq = seqItem.userSeq
//     // console.log('that', that);
//     // console.log('typeof that', typeof that);
//     // console.log('that._id', that._id);
//     that._id = seqItem.userSeq
//     next()
//   })
// })
const User = mongoose.model('User', userSchema)
const Role = mongoose.model('Role', roleSchema)
const Menu = mongoose.model('Menu', menuSchema)
const DictType = mongoose.model('DictType', dictTypeSchema)
const DictData = mongoose.model('DictData', dictDataSchema)
const Config = mongoose.model('Config', configSchema)
const Article = mongoose.model('Article', articleSchema)
const Comment = mongoose.model('Comment', commentSchema)

/**
 * 
 * @param {Schema} modelSchema 
 * @param {String} modelName 
 * @param {Model} Seq 
 */
function preSaveWithIdIncrement(modelSchema, modelName, Seq) {
  modelSchema.pre('save', function (next) {
    const that = this
    const modelSeqProName = `${modelName}Seq`
    Seq.findOneAndUpdate({ _id: modelName }, { $inc: { [modelSeqProName]: 1 } }, { new: true, upsert: true }, function (error, seqItem) {
      if (error) {
        return next(error)
      }
      that[`${modelName}Id`] = seqItem[modelSeqProName]
      next()
    })
  })
}

// 生产环境则初始化数据？
// if (process.env.NODE_ENV === 'production') {
//   const adminUser = new User({
//     username: 'admin',
//     password: 'xgg0105',
//     avatar: 'N',
//     role: 'admin'
//   })
//   adminUser.save()
// }

// 如果User集合中不存在数据，则初始化数据
;(async () => {
  const users = await User.find({})
  const roles = await Role.find({})
  const menus = await Menu.find({})
  if (users.length === 0) {
    console.log('初始化用户数据');
    const adminUser = await new User({
      userName: 'admin',
      nickName: '管理员',
      password: 'xgg0105',
      avatar: 'N',
      role: 'admin',
      email: 'mutuguangda@foxmail.com',
    }).save()
    // await modelSaveWithIdIncrement(User, adminUserData, console.log)
    const guestUser = await new User({
      userName: 'guest',
      nickName: '访客',
      password: 'xgg0105',
      avatar: 'N',
      role: 'guest',
      email: 'guest@vanillanote.com',
    }).save()
    // await modelSaveWithIdIncrement(User, guestUserData, console.log)
  }
  if (roles.length === 0) {
    console.log('初始化角色数据');
    const adminRole = await new Role({
      roleName: '管理员',
      roleKey: 'admin',
      menuIds: null
    }).save()
    const guestRole = await new Role({
      roleName: '访客',
      roleKey: 'guestor',
      menuIds: null,
    }).save()
  }
  if (menus.length === 0) {
    console.log('初始化菜单数据');
    const systemMenu = await new Menu({
      menuName: '系统管理',
    }).save()
  }
})()

// 组织导出模型看类
module.exports = {
  User,
  Role,
  // UserLog,
  UserOnline,
  Article,
  Tag,
  Topic,
  Site,
  Comment,
  // Setting,
  Memo,
  Menu,
  Seq,
  DictType,
  DictData,
  Config,
  Recommendation,
}
