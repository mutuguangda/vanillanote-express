module.exports = [
  {
    // 访问者-拥有浏览权限
    roles: 'guest',
    allows: [
      {
        resources: [
          '/article/list'
        ],
        permissions: '*'
      },
    ]
  },
  {
    // 一般用户-拥有个别权限
    roles: 'user',
    allows: [
      { 
        resources: [
          '/admin/:articleId'
        ], 
        permissions: '*'
      },
    ]
  },
  {
    // 管理员-拥有全部权限
    roles: 'admin',
    allows: [
      { 
        resources: [
          '/article/init',
        ], 
        permissions: '*' 
      },
    ]
  },
];