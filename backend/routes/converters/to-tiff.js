const express = require("express");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const heicConvert = require("heic-convert");
const PSD = require("psd");
const { upload } = require("../../middlewares/multerConfig");
const { getFinalFileName } = require("../../utils/convertFileName"); // ⬅️ 공통 함수 임포트

const router = express.Router();

// ✅ 허용된 파일 형식 (TIFF 변환 가능)
const allowedFormats = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/bmp",
  "image/webp",
  "application/pdf", // 만약 PDF->TIFF가 필요한 경우, 추가 처리 로직 필요
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx -> TIFF 필요시 처리 로직 추가
  "image/heic",
  "image/avif",
  "image/vnd.adobe.photoshop", // PSD
];

router.post("/", upload.array("files"), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
  }

  try {
    const convertedFiles = [];
    const fileNames = []; // 프론트에 내려줄 파일명 목록
    const convertedPath = path.join(__dirname, "../../uploads/converted/");

    if (!fs.existsSync(convertedPath)) {
      fs.mkdirSync(convertedPath, { recursive: true });
    }

    for (const file of req.files) {
      console.log("✅ 원본 파일명:", file.originalname);

      // 파일 형식 확인
      if (!allowedFormats.includes(file.mimetype)) {
        return res.status(400).json({
          message: `지원되지 않는 파일 형식입니다: ${file.mimetype}`,
        });
      }

      // 1) .tiff 확장자로 최종 파일명 생성
      const { finalNameWithoutUUID, outputFileName } = getFinalFileName(
        file.originalname,
        ".tiff"
      );
      console.log("✅ 최종 저장 파일명:", outputFileName);

      const outputFilePath = path.join(convertedPath, outputFileName);

      // 2) 변환 로직
      try {
        // JPEG, PNG, GIF, BMP, WEBP, AVIF
        if (
          [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/bmp",
            "image/webp",
            "image/avif",
          ].includes(file.mimetype)
        ) {
          await sharp(file.path).toFormat("tiff").toFile(outputFilePath);
        }
        // HEIC -> TIFF
        else if (file.mimetype === "image/heic") {
          const inputBuffer = fs.readFileSync(file.path);
          const outputBuffer = await heicConvert({
            buffer: inputBuffer,
            format: "TIFF",
          });
          fs.writeFileSync(outputFilePath, outputBuffer);
        }
        // PSD -> TIFF
        else if (file.mimetype === "image/vnd.adobe.photoshop") {
          const psd = await PSD.fromFile(file.path);
          const pngBuffer = await psd.image.toPng(); // psd.image.toPng() => PNG
          await sharp(pngBuffer).toFormat("tiff").toFile(outputFilePath);
        }

        // 다른 형식(PDF, DOCX 등)을 TIFF로 변환하려면 추가 처리 로직 필요

        convertedFiles.push(`/download/${outputFileName}`);
        fileNames.push(finalNameWithoutUUID);
      } catch (error) {
        console.error("❌ 파일 변환 중 오류 발생:", error);
      }
    }

    // 변환 결과 응답
    return res.json({
      message: "파일 → TIFF 변환 성공!",
      downloadUrls: convertedFiles,
      fileNames,
    });
  } catch (error) {
    console.error("❌ 요청 처리 중 오류 발생:", error);
    return res
      .status(500)
      .json({ message: "파일 변환 중 오류 발생", error: error.message });
  }
});

module.exports = router;
