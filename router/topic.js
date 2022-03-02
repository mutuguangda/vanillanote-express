const express = require("express");
const topicCtrl = require("../controller/topic");

const router = express.Router();

// Get Tags
router.get("/topics", topicCtrl.getTopics);

module.exports = router;
