const express = require("express");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const svg2img = require("svg2img");
const heicConvert = require("heic-convert");
const { upload } = require("../../middlewares/multerConfig");
const { getFinalFileName } = require("../../utils/convertFileName"); // ⬅️ 공통 함수 임포트

const router = express.Router();

// ✅ 허용된 파일 형식 (GIF 변환 가능)
const allowedFormats = [
  "image/jpeg",
  "image/png",
  "image/bmp",
  "image/tiff",
  "image/webp",
  "image/svg+xml",
  "image/apng",
  "image/heic",
  "image/avif",
];

router.post("/", upload.array("files"), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
  }

  try {
    const convertedFiles = [];
    const fileNames = []; // 프론트로 보내줄 파일명 목록
    const convertedPath = path.join(__dirname, "../../uploads/converted/");

    for (const file of req.files) {
      console.log("✅ 원본 파일명:", file.originalname);

      if (!allowedFormats.includes(file.mimetype)) {
        return res
          .status(400)
          .json({ message: `지원되지 않는 파일 형식입니다: ${file.mimetype}` });
      }

      // 1) GIF 확장자를 목표로 파일명 생성
      const { finalNameWithoutUUID, outputFileName } = getFinalFileName(
        file.originalname,
        ".gif"
      );
      console.log("✅ 최종 저장 파일명:", outputFileName);

      const outputFilePath = path.join(convertedPath, outputFileName);

      // 2) 변환 로직 (Sharp, svg2img, heicConvert)
      try {
        // JPEG, PNG, BMP, TIFF, WEBP, APNG, AVIF
        if (
          [
            "image/jpeg",
            "image/png",
            "image/bmp",
            "image/tiff",
            "image/webp",
            "image/apng",
            "image/avif",
          ].includes(file.mimetype)
        ) {
          await sharp(file.path).toFormat("gif").toFile(outputFilePath);
        }
        // SVG → GIF
        else if (file.mimetype === "image/svg+xml") {
          await new Promise((resolve, reject) => {
            svg2img(file.path, (error, buffer) => {
              if (error) return reject(error);

              // 임시 PNG 파일 생성
              const tempPngPath = `${file.path}.png`;
              fs.writeFileSync(tempPngPath, buffer);

              sharp(tempPngPath)
                .toFormat("gif")
                .toFile(outputFilePath)
                .then(() => {
                  // 임시 PNG 파일 삭제 (선택적)
                  fs.unlinkSync(tempPngPath);
                  resolve();
                })
                .catch(reject);
            });
          });
        }
        // HEIC → GIF
        else if (file.mimetype === "image/heic") {
          const inputBuffer = fs.readFileSync(file.path);
          const outputBuffer = await heicConvert({
            buffer: inputBuffer,
            format: "PNG",
          });

          // 임시 PNG 파일 생성
          const tempPngPath = `${file.path}.png`;
          fs.writeFileSync(tempPngPath, outputBuffer);

          await sharp(tempPngPath).toFormat("gif").toFile(outputFilePath);

          // 임시 PNG 파일 삭제 (선택적)
          fs.unlinkSync(tempPngPath);
        }

        // 변환 성공 시 응답 데이터
        convertedFiles.push(`/download/${outputFileName}`);
        fileNames.push(finalNameWithoutUUID);
      } catch (error) {
        console.error("❌ 파일 변환 중 오류 발생:", error);
      }
    }

    // 변환 결과 응답
    return res.json({
      message: "파일 → GIF 변환 성공!",
      downloadUrls: convertedFiles,
      fileNames,
    });
  } catch (error) {
    console.error("❌ GIF 변환 중 오류 발생:", error);
    return res
      .status(500)
      .json({ message: "파일 변환 중 오류 발생", error: error.message });
  }
});

module.exports = router;
