const express = require("express");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const heicConvert = require("heic-convert");
const PSD = require("psd");
const { upload } = require("../../middlewares/multerConfig");
const { getFinalFileName } = require("../../utils/convertFileName"); // ⬅️ 공통 함수 임포트

const router = express.Router();

// ✅ 허용된 파일 형식 (PNG 변환 가능)
const allowedFormats = [
  "image/jpeg",
  "image/svg+xml",
  "image/gif",
  "image/bmp",
  "image/tiff",
  "image/webp",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "image/heic",
  "image/avif",
  "image/vnd.adobe.photoshop",
];

router.post("/", upload.array("files"), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
  }

  try {
    const convertedFiles = [];
    const fileNames = [];

    // 변환 결과 저장 폴더
    const convertedPath = path.join(__dirname, "../../uploads/converted/");

    for (const file of req.files) {
      console.log("✅ 원본 파일명:", file.originalname);

      if (!allowedFormats.includes(file.mimetype)) {
        return res
          .status(400)
          .json({ message: `지원되지 않는 파일 형식입니다: ${file.mimetype}` });
      }

      // 1) 공통 함수로 최종 파일명 생성 (.png)
      const { finalNameWithoutUUID, outputFileName } = getFinalFileName(
        file.originalname,
        ".png"
      );
      console.log("✅ 최종 저장 파일명:", outputFileName);

      const outputFilePath = path.join(convertedPath, outputFileName);

      try {
        // 2) 변환 로직 (JPEG/GIF/BMP/TIFF/WEBP/AVIF/HEIC/PSD 등 → PNG)
        if (
          [
            "image/jpeg",
            "image/gif",
            "image/bmp",
            "image/tiff",
            "image/webp",
            "image/avif",
          ].includes(file.mimetype)
        ) {
          await sharp(file.path).toFormat("png").toFile(outputFilePath);
        } else if (file.mimetype === "image/heic") {
          const inputBuffer = fs.readFileSync(file.path);
          const outputBuffer = await heicConvert({
            buffer: inputBuffer,
            format: "PNG",
          });
          fs.writeFileSync(outputFilePath, outputBuffer);
        } else if (file.mimetype === "image/vnd.adobe.photoshop") {
          const psd = await PSD.fromFile(file.path);
          const pngBuffer = await psd.image.toPng();
          await sharp(pngBuffer).toFormat("png").toFile(outputFilePath);
        }

        // 3) 응답용 데이터 푸시
        //    /download/uuid_filename.png
        convertedFiles.push(`/download/${outputFileName}`);
        //    filename.png
        fileNames.push(finalNameWithoutUUID);
      } catch (error) {
        console.error("❌ 파일 변환 중 오류 발생:", error);
      }
    }

    // 모든 파일 변환 후 응답
    return res.json({
      message: "파일 → PNG 변환 성공!",
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
