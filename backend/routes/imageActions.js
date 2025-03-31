// backend/routes/imageActions.js
const express = require("express");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { upload } = require("../middlewares/multerConfig");
const { getFinalFileName } = require("../utils/convertFileName");

const router = express.Router();

/**
 * 1) 이미지 최적화 (압축 + 리사이즈)
 * POST /api/image/optimize
 * form-data:
 *   - files (multiple)
 *   - quality (1~100, 기본 80)
 *   - width, height (리사이즈 값, optional)
 */
router.post("/optimize", upload.array("files"), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
  }

  try {
    const convertedFiles = [];
    const fileNames = [];
    const convertedPath = path.join(__dirname, "../uploads/converted/");
    if (!fs.existsSync(convertedPath)) {
      fs.mkdirSync(convertedPath, { recursive: true });
    }

    // 압축 품질
    const quality = parseInt(req.body.quality, 10) || 80;
    // 리사이즈
    const width = req.body.width ? parseInt(req.body.width, 10) : null;
    const height = req.body.height ? parseInt(req.body.height, 10) : null;

    for (const file of req.files) {
      console.log("✅ [Optimize] 원본 파일명:", file.originalname);

      // 최종 저장 파일명 (JPG로 가정)
      const { finalNameWithoutUUID, outputFileName } = getFinalFileName(
        file.originalname,
        ".jpg"
      );
      const outputFilePath = path.join(convertedPath, outputFileName);

      try {
        let pipeline = sharp(file.path);

        // 리사이즈
        if (width || height) {
          pipeline = pipeline.resize({ width, height, fit: "cover" });
        }

        // jpeg 품질 적용
        await pipeline.jpeg({ quality }).toFile(outputFilePath);

        convertedFiles.push(`/download/${outputFileName}`);
        fileNames.push(finalNameWithoutUUID);
      } catch (error) {
        console.error("❌ [Optimize] 변환 오류:", error);
      }
    }

    res.json({
      message: "이미지 최적화 완료!",
      downloadUrls: convertedFiles,
      fileNames,
    });
  } catch (error) {
    console.error("❌ [Optimize] 요청 처리 중 오류:", error);
    res
      .status(500)
      .json({ message: "이미지 최적화 중 오류 발생", error: error.message });
  }
});

/**
 * 2) 이미지 자르기 (Crop)
 * POST /api/image/crop
 * form-data:
 *   - files (multiple)
 *   - left, top, width, height
 */
router.post("/crop", upload.array("files"), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
  }

  try {
    const convertedFiles = [];
    const fileNames = [];
    const convertedPath = path.join(__dirname, "../uploads/converted/");
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

      try {
        await sharp(file.path)
          .extract({
            left,
            top,
            width: cropWidth,
            height: cropHeight,
          })
          .toFile(outputFilePath);

        convertedFiles.push(`/download/${outputFileName}`);
        fileNames.push(finalNameWithoutUUID);
      } catch (error) {
        console.error("❌ [Crop] 자르기 오류:", error);
      }
    }

    res.json({
      message: "이미지 자르기 완료!",
      downloadUrls: convertedFiles,
      fileNames,
    });
  } catch (error) {
    console.error("❌ [Crop] 요청 처리 중 오류:", error);
    res
      .status(500)
      .json({ message: "자르기 중 오류 발생", error: error.message });
  }
});

/**
 * 3) 이미지 회전 (Rotate)
 * POST /api/image/rotate
 * form-data:
 *   - files (multiple)
 *   - angle (예: 90, 180 등)
 */
router.post("/rotate", upload.array("files"), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
  }

  try {
    const convertedFiles = [];
    const fileNames = [];
    const convertedPath = path.join(__dirname, "../uploads/converted/");
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

      try {
        await sharp(file.path).rotate(angle).toFile(outputFilePath);

        convertedFiles.push(`/download/${outputFileName}`);
        fileNames.push(finalNameWithoutUUID);
      } catch (error) {
        console.error("❌ [Rotate] 회전 오류:", error);
      }
    }

    res.json({
      message: "이미지 회전 완료!",
      downloadUrls: convertedFiles,
      fileNames,
    });
  } catch (error) {
    console.error("❌ [Rotate] 요청 처리 중 오류:", error);
    res
      .status(500)
      .json({ message: "회전 중 오류 발생", error: error.message });
  }
});

/**
 * 4) 이미지 워터마크 (Watermark)
 * POST /api/image/watermark
 * form-data:
 *   - files (multiple)
 *   - text (워터마크 문자열)
 */
router.post("/watermark", upload.array("files"), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
  }

  try {
    const convertedFiles = [];
    const fileNames = [];
    const convertedPath = path.join(__dirname, "../uploads/converted/");
    if (!fs.existsSync(convertedPath)) {
      fs.mkdirSync(convertedPath, { recursive: true });
    }

    // 워터마크로 사용할 문자열
    const watermarkText = req.body.text || "WATERMARK";

    for (const file of req.files) {
      console.log("✅ [Watermark] 원본 파일명:", file.originalname);

      const { finalNameWithoutUUID, outputFileName } = getFinalFileName(
        file.originalname,
        ".png"
      );
      const outputFilePath = path.join(convertedPath, outputFileName);

      try {
        const inputSharp = sharp(file.path);

        // 간단한 SVG → PNG 변환하여 합성
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

        await inputSharp
          .composite([{ input: watermarkPng, gravity: "center" }])
          .toFile(outputFilePath);

        convertedFiles.push(`/download/${outputFileName}`);
        fileNames.push(finalNameWithoutUUID);
      } catch (error) {
        console.error("❌ [Watermark] 워터마크 오류:", error);
      }
    }

    res.json({
      message: "이미지 워터마크 완료!",
      downloadUrls: convertedFiles,
      fileNames,
    });
  } catch (error) {
    console.error("❌ [Watermark] 요청 처리 중 오류:", error);
    res
      .status(500)
      .json({ message: "워터마크 중 오류 발생", error: error.message });
  }
});

module.exports = router;
