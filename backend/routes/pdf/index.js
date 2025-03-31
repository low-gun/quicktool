// backend/routes/pdf/index.js
const express = require("express");
const router = express.Router();

const pdfRotate = require("./pdfRotate");
const pdfMergeSplit = require("./pdfMergeSplit");
const pdfWatermark = require("./pdfWatermark");
const pdfEncrypt = require("./pdfEncrypt");

// /pdf/rotate
router.use("/rotate", pdfRotate);
// /pdf/merge-split
router.use("/merge-split", pdfMergeSplit);
// /pdf/watermark
router.use("/watermark", pdfWatermark);
// /pdf/encrypt
router.use("/encrypt", pdfEncrypt);

module.exports = router;
