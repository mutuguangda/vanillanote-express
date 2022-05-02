const schedule = require('node-schedule');

// 创建定时任务
exports.createJob = (job) => {
  jobHandler[job.jobHandlerName](job.params)
  process.task[job.jobName] = schedule.scheduleJob(job.cron, jobHandler[job.jobHandlerName] (job.jobHandlerName))
}    

// 取消定时任务
exports.cancelJob = (jobName) => {
  process.task[jobName] = null
} 

// 定时任务处理方法对象
const jobHandler = {
  notionSync() {
    console.log('nihao')
  }
}
