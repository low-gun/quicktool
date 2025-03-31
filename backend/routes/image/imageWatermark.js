// backend/routes/image/imageWatermark.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const router = express.Router();
const { upload } = require("../../middlewares/multerConfig");
const { getFinalFileName } = require("../../utils/convertFileName");

/**
 * POST /api/image-watermark
 * form-data:
 *   - files: multiple
 *   - text: 워터마크 문자열
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

    const watermarkText = req.body.text || "WATERMARK";

    for (const file of req.files) {
      console.log("✅ [Watermark] 원본 파일명:", file.originalname);

      const { finalNameWithoutUUID, outputFileName } = getFinalFileName(
        file.originalname,
        ".png"
      );
      const outputFilePath = path.join(convertedPath, outputFileName);

      // 원본 이미지를 PNG로 변환
      const inputSharp = sharp(file.path).toFormat("png");

      // 워터마크용 SVG 생성
      const svgContent = `
        <svg width="500" height="120">
          <style>
            .title {
              fill: rgba(255,0,0,0.5);
              font-size: 48px;
              font-weight: bold;
            }
          </style>
          <text x="50%" y="50%" text-anchor="middle" class="title">
            ${watermarkText}
          </text>
        </svg>
      `;
      const svgBuffer = Buffer.from(svgContent, "utf-8");
      const watermarkPng = await sharp(svgBuffer).png().toBuffer();

      // 합성
      await inputSharp
        .composite([{ input: watermarkPng, gravity: "center" }])
        .toFile(outputFilePath);

      convertedFiles.push(`/download/${outputFileName}`);
      fileNames.push(finalNameWithoutUUID);
    }

    return res.json({
      message: "이미지 워터마크 완료!",
      downloadUrls: convertedFiles,
      fileNames,
    });
  } catch (error) {
    console.error("❌ [Watermark] 오류:", error);
    return res
      .status(500)
      .json({ message: "이미지 워터마크 중 오류 발생", error: error.message });
  }
});

module.exports = router;
