require('module-alias/register')
require('dotenv').config()
const express = require("express");
const morgan = require("morgan");
const router = require("@/router");
const errorHandler = require("@/middleware/error-handler");
// 这里定义一个全局变量
process.task = {}
require("@/model");
const app = express();
app.use(morgan("dev"));
// app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb' }));

const PORT = process.env.PORT || 3000;

// 挂载路由
app.use("/api", router);

// 挂载统一处理服务端错误中间件
app.use(errorHandler());

app.listen(PORT, () => {
  console.log(`Server is running at http://loaclhost:${PORT}`);
});
