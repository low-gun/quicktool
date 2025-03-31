// backend/routes/image/imageOptimize.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const router = express.Router();
const { upload } = require("../../middlewares/multerConfig");
const { getFinalFileName } = require("../../utils/convertFileName");

/**
 * POST /api/image-optimize
 * form-data:
 *   - files (multiple)
 *   - quality (1~100)
 *   - width (optional)
 *   - height (optional)
 */
router.post("/", upload.array("files"), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
  }

  try {
    const convertedFiles = [];
    const fileNames = [];

    const convertedPath = path.join(__dirname, "../../../uploads/converted/");
    if (!fs.existsSync(convertedPath)) {
      fs.mkdirSync(convertedPath, { recursive: true });
    }

    // 품질 & 리사이즈 파라미터
    const quality = parseInt(req.body.quality, 10) || 80;
    const width = req.body.width ? parseInt(req.body.width, 10) : null;
    const height = req.body.height ? parseInt(req.body.height, 10) : null;

    for (const file of req.files) {
      console.log("✅ [Optimize] 원본:", file.originalname);

      // 최종 파일명 (jpg)
      const { finalNameWithoutUUID, outputFileName } = getFinalFileName(
        file.originalname,
        ".jpg"
      );
      const outputFilePath = path.join(convertedPath, outputFileName);

      let pipeline = sharp(file.path);

      // 리사이즈
      if (width || height) {
        pipeline = pipeline.resize({ width, height, fit: "cover" });
      }

      // jpeg 압축 품질
      await pipeline.jpeg({ quality }).toFile(outputFilePath);

      convertedFiles.push(`/download/${outputFileName}`);
      fileNames.push(finalNameWithoutUUID);
    }

    return res.json({
      message: "이미지 최적화 완료!",
      downloadUrls: convertedFiles,
      fileNames,
    });
  } catch (error) {
    console.error("❌ [Optimize] 오류:", error);
    return res
      .status(500)
      .json({ message: "이미지 최적화 중 오류 발생", error: error.message });
  }
});

module.exports = router;
