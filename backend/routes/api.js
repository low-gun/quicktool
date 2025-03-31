// backend/routes/api.js
const express = require("express");
const router = express.Router();
// ────────── 기존 변환 모듈 (to-xxx) ──────────
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

// ────────── (새로 추가) 이미지 편집용 모듈 (image-xxx) ──────────
const imageOptimize = require("./image/imageOptimize");
const imageCrop = require("./image/imageCrop");
const imageRotate = require("./image/imageRotate");
const imageWatermark = require("./image/imageWatermark");

// ────────── (추가) OCR 라우트 ──────────
const ocrRouter = require("./ocr/ocrExtract");

// ────────── PDF 라우트 ──────────
const pdfRouter = require("./pdf");

// ────────── (신규) 비디오 관련 라우트 (video/index.js) ──────────
const videoRouter = require("./video");

// ────────── (신규) 클라우드 업로드 라우트 (cloudUpload/index.js) ──────────
const cloudRouter = require("./cloudUpload");
const notesRouter = require("./notes");
// 상태 체크용 (GET /api/status)
router.get("/status", (req, res) => {
  console.log(`✅ Express가 받은 요청 URL: ${req.originalUrl}`);
  res.json({ status: "OK", message: "API is running" });
});

// ─────────────────────────────────────────────────────────
// 기존 "to-xxx" 라우트 (문서/파일 변환)
// ─────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────
// 새로 추가: 이미지 편집 라우트 ("image-xxx")
// ─────────────────────────────────────────────────────────
router.use("/image-optimize", imageOptimize);
router.use("/image-crop", imageCrop);
router.use("/image-rotate", imageRotate);
router.use("/image-watermark", imageWatermark);

// ─────────────────────────────────────────────────────────
// (추가) OCR 라우트
// ─────────────────────────────────────────────────────────
router.use("/ocr", ocrRouter);

// ─────────────────────────────────────────────────────────
// (추가) PDF 라우트
// ─────────────────────────────────────────────────────────
router.use("/pdf", pdfRouter);

// ─────────────────────────────────────────────────────────
// (신규) 비디오 라우트 (/video/...)
// ─────────────────────────────────────────────────────────
router.use("/video", videoRouter);

// ─────────────────────────────────────────────────────────
// (신규) 클라우드 라우트 (/cloud/...)
// ─────────────────────────────────────────────────────────
router.use("/cloud", cloudRouter);
router.use("/notes", notesRouter);
// 홈 라우트: 사용 가능한 변환 목록 안내 (GET /api)
router.get("/", (req, res) => {
  res.json({
    message: "Backend API is Running!",
    availableRoutes: [
      // 기존 to-xxx
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
      // 새로 추가 (image-xxx)
      "/image-optimize",
      "/image-crop",
      "/image-rotate",
      "/image-watermark",
      // OCR
      "/ocr",
      // PDF
      "/pdf/rotate",
      "/pdf/merge-split",
      "/pdf/watermark",
      "/pdf/encrypt",
      // (신규) 비디오
      "/video/resolution",
      "/video/subtitle",
      "/video/trim",
      // (신규) 클라우드
      "/cloud/dropbox",
      "/cloud/google-drive",
      "/cloud/one-drive",
    ],
  });
});

module.exports = router;
