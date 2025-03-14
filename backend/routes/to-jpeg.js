const express = require("express");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { upload } = require("../middlewares/multerConfig");

const router = express.Router();

const allowedFormats = [
  "image/png",
  "image/jpeg",
  "image/svg+xml",
  "image/gif",
  "image/bmp",
  "image/tiff",
  "image/webp",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

router.post("/", upload.array("files"), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
  }

  try {
    const convertedFiles = [];

    for (const file of req.files) {
      if (!allowedFormats.includes(file.mimetype)) {
        return res
          .status(400)
          .json({ message: `지원되지 않는 파일 형식입니다: ${file.mimetype}` });
      }

      // ✅ multer에서 저장된 파일명을 그대로 사용
      const originalFilePath = file.path;
      const outputFileName = file.filename; // ✅ multer에서 저장한 파일명 사용
      const outputFilePath = path.join(
        __dirname,
        "../uploads/converted/",
        outputFileName
      );

      // ✅ 파일 존재 여부 확인
      if (!fs.existsSync(originalFilePath)) {
        console.error("❌ 변환할 원본 파일이 존재하지 않음:", originalFilePath);
        return res.status(500).json({ message: "파일이 존재하지 않습니다." });
      }

      await sharp(originalFilePath)
        .jpeg({ quality: 80, mozjpeg: true })
        .toFile(outputFilePath);
      convertedFiles.push(`/download/${outputFileName}`);
    }

    res.json({
      message: "파일 → JPEG 변환 성공!",
      downloadUrls: convertedFiles,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "파일 변환 중 오류 발생", error: error.message });
  }
});

module.exports = router;
