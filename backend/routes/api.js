const express = require("express");
const toJpeg = require("./converters/to-jpeg");
const toPng = require("./converters/to-png");
const toGif = require("./converters/to-gif");
const toTiff = require("./converters/to-tiff");
const toBmp = require("./converters/to-bmp");
const toWebp = require("./converters/to-webp");
const toSvg = require("./converters/to-svg");
const toHeic = require("./converters/to-heic");
const toPdf = require("./converters/to-pdf");
const toDocx = require("./converters/to-docx");
const toTxt = require("./converters/to-txt");
const toZip = require("./converters/to-zip");
const toPpt = require("./converters/to-ppt");
const toMp3 = require("./converters/to-mp3");
const toWav = require("./converters/to-wav");
const toMp4 = require("./converters/to-mp4");
const toMov = require("./converters/to-mov");
const toMkv = require("./converters/to-mkv");
const toAvi = require("./converters/to-avi");
const toExcel = require("./converters/to-excel");
const toCsv = require("./converters/to-csv");
const toJson = require("./converters/to-json");
const toXml = require("./converters/to-xml");
const toHtml = require("./converters/to-html");
const toHwp = require("./converters/to-hwp");

const router = express.Router();

router.get("/status", (req, res) => {
  console.log(`✅ Express가 받은 요청 URL: ${req.originalUrl}`);
  res.json({ status: "OK", message: "API is running" });
});

router.use("/to-jpeg", toJpeg);
router.use("/to-png", toPng);
router.use("/to-gif", toGif);
router.use("/to-tiff", toTiff);
router.use("/to-bmp", toBmp);
router.use("/to-webp", toWebp);
router.use("/to-svg", toSvg);
router.use("/to-heic", toHeic);
router.use("/to-pdf", toPdf);
router.use("/to-docx", toDocx);
router.use("/to-txt", toTxt);
router.use("/to-zip", toZip);
router.use("/to-ppt", toPpt);
router.use("/to-mp3", toMp3);
router.use("/to-wav", toWav);
router.use("/to-mp4", toMp4);
router.use("/to-mov", toMov);
router.use("/to-mkv", toMkv);
router.use("/to-avi", toAvi);
router.use("/to-excel", toExcel);
router.use("/to-csv", toCsv);
router.use("/to-json", toJson);
router.use("/to-xml", toXml);
router.use("/to-html", toHtml);
router.use("/to-hwp", toHwp);

router.get("/", (req, res) => {
  res.json({
    message: "Backend API is Running!",
    availableRoutes: [
      "/to-jpeg",
      "/to-png",
      "/to-gif",
      "/to-tiff",
      "/to-bmp",
      "/to-webp",
      "/to-svg",
      "/to-heic",
      "/to-pdf",
      "/to-docx",
      "/to-txt",
      "/to-zip",
      "/to-ppt",
      "/to-mp3",
      "/to-wav",
      "/to-mp4",
      "/to-mov",
      "/to-mkv",
      "/to-avi",
      "/to-excel",
      "/to-csv",
      "/to-json",
      "/to-xml",
      "/to-html",
      "/to-hwp",
    ],
  });
});

module.exports = router;
