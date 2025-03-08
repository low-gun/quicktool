const express = require("express");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { upload } = require("../middlewares/multerConfig"); // 업로드 미들웨어

const router = express.Router();

// 허용된 파일 형식 (JPG, PNG, GIF, BMP, TIFF만 가능)
const allowedFormats = [
  "image/jpeg",
  "image/png",
  "image/bmp",
  "image/tiff",
  "image/webp",
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

      const outputFileName = `${path
        .parse(file.originalname)
        .name.replace(/[^a-zA-Z0-9-_]/g, "")}.gif`;
      const outputFilePath = `uploads/converted/${outputFileName}`;

      await sharp(file.path).toFormat("gif").toFile(outputFilePath);

      convertedFiles.push(`/download/${outputFileName}`);
    }

    res.json({
      message: "파일 → GIF 변환 성공!",
      downloadUrls: convertedFiles,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "파일 변환 중 오류 발생", error: error.message });
  }
});

module.exports = router;
