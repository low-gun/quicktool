const express = require("express");
const toJpeg = require("./to-jpeg");
const toPng = require("./to-png");
const toGif = require("./to-gif");
const toTiff = require("./to-tiff");
const toBmp = require("./to-bmp");
const toWebp = require("./to-webp");
const toSvg = require("./to-svg");
const toHeic = require("./to-heic");
const toPdf = require("./to-pdf");
const toDocx = require("./to-docx");
const toTxt = require("./to-txt");
const toZip = require("./to-zip");

const router = express.Router();
router.get("/status", (req, res) => {
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
    ],
  });
});

module.exports = router;
