// backend/routes/image/imageRotate.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const router = express.Router();
const { upload } = require("../../middlewares/multerConfig");
const { getFinalFileName } = require("../../utils/convertFileName");

/**
 * POST /api/image-rotate
 * form-data:
 *   - files (multiple)
 *   - angle (예: 90, 180, 270)
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

    const angle = parseInt(req.body.angle, 10) || 0;

    for (const file of req.files) {
      console.log("✅ [Rotate] 원본 파일명:", file.originalname);

      const { finalNameWithoutUUID, outputFileName } = getFinalFileName(
        file.originalname,
        ".png"
      );
      const outputFilePath = path.join(convertedPath, outputFileName);

      await sharp(file.path).rotate(angle).toFile(outputFilePath);

      convertedFiles.push(`/download/${outputFileName}`);
      fileNames.push(finalNameWithoutUUID);
    }

    return res.json({
      message: "이미지 회전 완료!",
      downloadUrls: convertedFiles,
      fileNames,
    });
  } catch (error) {
    console.error("❌ [Rotate] 오류:", error);
    return res
      .status(500)
      .json({ message: "이미지 회전 중 오류 발생", error: error.message });
  }
});

module.exports = router;
