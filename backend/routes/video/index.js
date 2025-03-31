// backend/routes/video/index.js
const express = require("express");
const router = express.Router();

const videoResolution = require("./videoResolution");
const videoSubtitle = require("./videoSubtitle");
const videoTrim = require("./videoTrim");

// /api/video/resolution
router.use("/resolution", videoResolution);
// /api/video/subtitle
router.use("/subtitle", videoSubtitle);
// /api/video/trim
router.use("/trim", videoTrim);

module.exports = router;
