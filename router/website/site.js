const express = require("express");
const siteCtrl = require("@/controller/site");

const router = express.Router();

// Get Site
router.get("/", siteCtrl.getSite);

// Update Site
router.put('/update/:siteId', siteCtrl.updateSite);

module.exports = router;
