/**
 * 实现自增id
 * @param {*} Model 
 * @param {*} data 
 * @param {*} callback 
 */
exports.modelSaveWithIdIncrement = async (Model, data, callback) => {
  try {
    const modelsCount = await Model.countDocuments()
    data.seq = modelsCount + 1
    await new Model(data).save()
  } catch (error) {
    callback(error)
  }
}

// 获得当前ISO规范的时间
exports.getCurrentTime = () => {
  const timestamp = Date.parse(new Date());
  const newDate = new Date(timestamp);
  newDate.getTime(timestamp * 1000);
  return newDate.toISOString()
}