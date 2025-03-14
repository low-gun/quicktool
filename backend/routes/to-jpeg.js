const express = require("express");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { upload } = require("../middlewares/multerConfig"); // 업로드 미들웨어

const router = express.Router();

// 허용된 파일 형식 (JPG, PNG, GIF, BMP, TIFF만 가능)
const allowedFormats = [
  "image/png",
  "image/jpeg",
  "image/svg+xml",
  "image/gif",
  "image/bmp",
  "image/tiff",
  "image/webp",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
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

      // (1) 한글(가-힣), 영어, 숫자, 대시, 언더바만 남김
      const sanitizedName = path
        .parse(file.originalname)
        .name.replace(/[^a-zA-Z0-9가-힣-_]/g, "");

      // (2) .jpeg 확장자를 붙여 최종 파일명 생성
      const outputFileName = `${sanitizedName}.jpeg`;

      // (3) 디스크 저장 경로
      const outputFilePath = `uploads/converted/${outputFileName}`;

      // await sharp(file.path).toFormat("jpeg").toFile(outputFilePath);
      await sharp(file.path)
        .jpeg({ quality: 80, mozjpeg: true }) // 품질 조정 및 고속 변환 옵션 적용
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
