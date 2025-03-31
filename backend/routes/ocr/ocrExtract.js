// backend/routes/ocr/ocrExtract.js

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { upload } = require("../../middlewares/multerConfig");
const Tesseract = require("node-tesseract-ocr");

/**
 * @route POST /api/ocr/extract
 * @desc  OCR 추출 (이미지 → 텍스트)
 * @form-data
 *    - file: single (이미지 파일 - png,jpg,bmp,tiff 등)
 *    - lang: (옵션) "eng", "kor" 등 Tesseract 언어 코드
 */
router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
  }

  try {
    console.log("✅ [OCR] 업로드 파일명:", req.file.originalname);

    // Tesseract 옵션
    const tesseractOptions = {
      lang: req.body.lang || "eng", // 언어 코드, 예: "eng", "kor"
      oem: 1, // OCR Engine Mode (Default: 1, LSTM only)
      psm: 3, // Page Segmentation Mode
    };

    // OCR 실행
    const text = await Tesseract.recognize(req.file.path, tesseractOptions);
    console.log("✅ [OCR] 인식 결과:", text.substring(0, 50), "...");

    // 필요하다면 업로드된 파일을 삭제
    // fs.unlinkSync(req.file.path);

    return res.json({
      message: "OCR 추출 성공!",
      recognizedText: text,
    });
  } catch (error) {
    console.error("❌ [OCR] 오류 발생:", error);
    return res.status(500).json({
      message: "OCR 처리 중 오류",
      error: error.message,
    });
  }
});

module.exports = router;
