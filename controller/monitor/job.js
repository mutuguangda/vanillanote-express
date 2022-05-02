const { Job } = require("@/model");
const { createJob, cancelJob } = require('@/util/job')
const schedule = require('node-schedule');

// 添加定时任务
exports.addJob = async (req, res, next) => {
  try {
    const job = await new Job(req.body).save()
    const saveJob = job.toJSON();
    // 创建定时任务
    createJob(saveJob)
    // process.task[saveJob.jobName] = schedule.scheduleJob(saveJob.cron, function () {
    //   console.log(saveJob.params);
    // })
    // 4. 发送成功响应
    res.status(200).json({
      code: 200,
      msg: '操作成功',
      job: saveJob
    });
  } catch (err) {
    next(err);
  }
};

// 更新定时任务
exports.updateJob = async (req, res, next) => {
  try {
    const job = req.body
    const updateJob = await Job.findOneAndUpdate({ jobId: job.jobId }, job, { returnDocument: 'after' })
    if (job.params !== updateJob.params || job.jobHandlerName !== updateJob.jobHandlerName || job.cron !== updateJob.cron || job.jobName !== updateJob.jobName) {
      // 先取消定时任务, 防止内存溢出
      // cancelJob(job.jobName)
      // 再创建定时任务, 实现更新操作
      createJob(updateJob)
    }
    res.status(200).json({
      code: 200,
      msg: '操作成功'
    })
  } catch (err) {
    next(err)
  }
};

// 获得定时任务列表
exports.listJob = async (req, res, next) => {
  try {
    // 默认取到 5 个
    const { pageNum, pageSize, jobName, jobKey, status, createdTime } = req.query;
    const filter = {}
    if (jobName) filter.jobName = jobName
    if (jobKey) filter.jobKey = jobKey
    if (status) filter.status = status
    if (createdTime) filter.createdTime = createdTime
    const jobs = await Job.find(filter)
      .skip((pageNum - 1) * pageSize) // 跳过多少条
      .limit(+pageSize) // 取多少条
      .sort({
        jobSort: 1
      })
    // 定时任务总数
    const jobsCount = await Job.countDocuments();
    res.status(200).json({
      msg: '成功',
      code: 200,
      rows: jobs,
      total: jobsCount,
    });
  } catch (err) {
    next(err);
  }
}

// 获得定时任务信息
exports.getJob = async (req, res, next) => {
  try {
    const jobId = req.params.jobId
    const job = await Job.findOne({ jobId })
    if (!job) {
      return res.status(404).end();
    }
    res.status(200).json({
      code: 200,
      msg: '操作成功',
      data: job,
    });
  } catch (err) {
    next(err);
  }
}

// 删除定时任务
exports.deleteJob = async (req, res, next) => {
  try {
    const jobId = req.params.jobId
    const job = await Job.findOneAndDelete({ jobId })
    if (!job) {
      return res.status(404).end();
    }
    cancelJob(job.jobName)
    res.status(200).json({
      code: 200,
      msg: '操作成功',
      job,
    });
  } catch (err) {
    next(err);
  }
}

// 定时任务状态修改
exports.changeStatus = async (req, res, next) => {
  try {
    const { jobId, status } = req.body
    const job = await Job.findOneAndUpdate({ jobId }, {
      status
    })
    if (!job) {
      return res.status(404).end();
    }
    if (status === '0') createJob(job)
    else cancelJob(job.jobName)
    res.status(200).json({
      code: 200,
      msg: '操作成功',
    })
  } catch (err) {
    next(err);
  }
};