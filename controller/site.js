const { Site } = require('@/model');

// Get Site
exports.getSite = async (req, res, next) => {
  try {
    let site = await Site.find({})
    site = site[0]
    if (site === undefined) {
      site = await new Site({}).save()
    }
    res.status(200).json({
      site
    })
  } catch (err) {
    next(err);
  }
}

// update Site
exports.updateSite = async (req, res, next) => {
  try {
    const bodySite = req.body.site;
    const site = await Site.findByIdAndUpdate(req.params.siteId, bodySite, { returnDocument: "after" });
    res.status(201).json({
      msg: '更新成功!',
      site
    })
  } catch (err) {
    next(err);
  }
}