// backend/routes/image/imageCrop.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const router = express.Router();
const { upload } = require("../../middlewares/multerConfig");
const { getFinalFileName } = require("../../utils/convertFileName");

/**
 * POST /api/image-crop
 * form-data:
 *   - files (multiple)
 *   - left, top, width, height
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

    const left = parseInt(req.body.left, 10) || 0;
    const top = parseInt(req.body.top, 10) || 0;
    const cropWidth = parseInt(req.body.width, 10) || 100;
    const cropHeight = parseInt(req.body.height, 10) || 100;

    for (const file of req.files) {
      console.log("✅ [Crop] 원본 파일명:", file.originalname);

      const { finalNameWithoutUUID, outputFileName } = getFinalFileName(
        file.originalname,
        ".png"
      );
      const outputFilePath = path.join(convertedPath, outputFileName);

      await sharp(file.path)
        .extract({ left, top, width: cropWidth, height: cropHeight })
        .toFile(outputFilePath);

      convertedFiles.push(`/download/${outputFileName}`);
      fileNames.push(finalNameWithoutUUID);
    }

    return res.json({
      message: "이미지 자르기 완료!",
      downloadUrls: convertedFiles,
      fileNames,
    });
  } catch (error) {
    console.error("❌ [Crop] 오류:", error);
    return res
      .status(500)
      .json({ message: "이미지 자르기 중 오류 발생", error: error.message });
  }
});

module.exports = router;
