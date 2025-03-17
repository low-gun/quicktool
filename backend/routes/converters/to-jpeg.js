const express = require("express");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const heicConvert = require("heic-convert");
const PSD = require("psd");
const { fromPath } = require("pdf2pic"); // ✨ 라이브러리 교체
const mammoth = require("mammoth");
const svg2img = require("svg2img");
const { upload } = require("../../middlewares/multerConfig");
const { getFinalFileName } = require("../../utils/convertFileName"); // ⬅️ 공통 함수 임포트

const router = express.Router();

// ✅ 허용된 파일 형식 (JPEG 변환 가능)
const allowedFormats = [
  "image/png",
  "image/jpeg",
  "image/svg+xml",
  "image/gif",
  "image/bmp",
  "image/tiff",
  "image/webp",
  "image/heic",
  "image/avif",
  "image/vnd.adobe.photoshop",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

router.post("/", upload.array("files"), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
  }

  try {
    const convertedFiles = [];
    const fileNames = []; // 프론트에 내려줄 파일명
    const convertedPath = path.join(__dirname, "../../uploads/converted");

    // 업로드된 파일마다 처리
    for (const file of req.files) {
      console.log("✅ 원본 파일명:", file.originalname);

      if (!allowedFormats.includes(file.mimetype)) {
        return res
          .status(400)
          .json({ message: `지원되지 않는 파일 형식입니다: ${file.mimetype}` });
      }

      // 1) .jpeg 확장자로 최종 파일명 생성
      const { finalNameWithoutUUID, outputFileName } = getFinalFileName(
        file.originalname,
        ".jpeg"
      );
      console.log("✅ 최종 저장 파일명:", outputFileName);

      const outputFilePath = path.join(convertedPath, outputFileName);

      // 2) 변환 로직
      try {
        // (PNG, JPEG, GIF, BMP, TIFF, WEBP, AVIF) → JPEG
        if (
          [
            "image/png",
            "image/jpeg",
            "image/gif",
            "image/bmp",
            "image/tiff",
            "image/webp",
            "image/avif",
          ].includes(file.mimetype)
        ) {
          await sharp(file.path).toFormat("jpeg").toFile(outputFilePath);
        }
        // HEIC → JPEG
        else if (file.mimetype === "image/heic") {
          const inputBuffer = fs.readFileSync(file.path);
          const outputBuffer = await heicConvert({
            buffer: inputBuffer,
            format: "JPEG",
          });
          fs.writeFileSync(outputFilePath, outputBuffer);
        }
        // PSD → JPEG
        else if (file.mimetype === "image/vnd.adobe.photoshop") {
          const psd = await PSD.fromFile(file.path);
          const pngBuffer = await psd.image.toPng();
          await sharp(pngBuffer).toFormat("jpeg").toFile(outputFilePath);
        }
        // PDF → JPEG (pdf2pic 사용)
        else if (file.mimetype === "application/pdf") {
          // 여러 페이지가 있으면 여러 JPEG가 생성됩니다.
          const pdfOptions = {
            density: 100,
            savePath: convertedPath,
            format: "jpg", // pdf2pic은 "jpg"로 지정
            saveFilename: path.parse(file.filename).name,
            quality: 100,
          };

          const converter = fromPath(file.path, pdfOptions);
          await converter.bulk(-1);
          // 여러 페이지면 여러 개의 jpg 파일이 생성됨.
          // 이 예시는 단순히 변환만 수행.
          // 한 파일만 반환하는 기존 구조와 다를 수 있음.
        }
        // DOCX → JPEG (mammoth -> text -> Buffer -> sharp)
        else if (
          file.mimetype ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          const docText = await mammoth.extractRawText({ path: file.path });
          // docText.value: 추출된 텍스트
          const buffer = Buffer.from(docText.value, "utf-8");
          await sharp(buffer).toFormat("jpeg").toFile(outputFilePath);
        }
        // SVG → PNG → JPEG
        else if (file.mimetype === "image/svg+xml") {
          await new Promise((resolve, reject) => {
            svg2img(file.path, (error, buffer) => {
              if (error) return reject(error);

              const tempPngPath = `${file.path}.png`;
              fs.writeFileSync(tempPngPath, buffer);

              sharp(tempPngPath)
                .toFormat("jpeg")
                .toFile(outputFilePath)
                .then(() => {
                  fs.unlinkSync(tempPngPath); // 임시 png 파일 삭제
                  resolve();
                })
                .catch(reject);
            });
          });
        }

        // 변환 성공 시 다운로드 목록과 파일명 목록에 추가
        convertedFiles.push(`/download/${outputFileName}`);
        fileNames.push(finalNameWithoutUUID);
      } catch (error) {
        console.error("❌ 파일 변환 중 오류 발생:", error);
      }
    }

    return res.json({
      message: "파일 → JPEG 변환 성공!",
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
