// backend/routes/video/videoResolution.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const ffmpeg = require("fluent-ffmpeg");

// 업로드 폴더 설정 (원본 파일)
const upload = multer({ dest: "uploads/original" });

// 변환 후 저장 경로
const convertedPath = path.join(__dirname, "../../uploads/converted");

// POST /api/video/resolution
router.post("/", upload.single("files"), async (req, res) => {
  try {
    // 해상도 파라미터 (예: width=1280, height=720)
    const { width, height } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "No video file uploaded" });
    }
    if (!width || !height) {
      return res.status(400).json({ error: "width, height are required" });
    }

    const inputPath = req.file.path; // 원본 경로
    const ext = path.extname(req.file.originalname) || ".mp4";
    // 변환된 파일명
    const outputFilename = `${uuidv4()}_${req.file.originalname.replace(
      /[^a-zA-Z0-9가-힣-_]/g,
      ""
    )}${ext}`;
    const outputPath = path.join(convertedPath, outputFilename);

    // ffmpeg 변환
    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .size(`${width}x${height}`)
        .on("end", resolve)
        .on("error", reject)
        .save(outputPath);
    });

    // 변환이 끝나면 응답: /download 경로 활용
    const downloadUrl = `/download/${outputFilename}`;
    return res.json({ downloadUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
