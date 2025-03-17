const express = require("express");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const potrace = require("potrace");
// ❌ pdfPoppler 제거
// const pdfPoppler = require("pdf-poppler");
// ✅ pdf2pic 사용
const { fromPath } = require("pdf2pic");
const mammoth = require("mammoth");
const { upload } = require("../../middlewares/multerConfig");
const { getFinalFileName } = require("../../utils/convertFileName"); // ⬅️ 공통 함수 임포트

const router = express.Router();

// ✅ 확장된 허용 파일 형식 (SVG 변환 가능)
const allowedFormats = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/bmp",
  "image/tiff",
  "image/webp",
  "image/heic",
  "image/avif",
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
    const convertedPath = path.join(__dirname, "../../uploads/converted/");

    if (!fs.existsSync(convertedPath)) {
      fs.mkdirSync(convertedPath, { recursive: true });
    }

    for (const file of req.files) {
      console.log("✅ 원본 파일명:", file.originalname);

      // 지원하는 형식인지 체크
      if (!allowedFormats.includes(file.mimetype)) {
        return res.status(400).json({
          message: `지원되지 않는 파일 형식입니다: ${file.mimetype}`,
        });
      }

      // 1) .svg 확장자로 최종 파일명 생성
      const { finalNameWithoutUUID, outputFileName } = getFinalFileName(
        file.originalname,
        ".svg"
      );
      console.log("✅ 최종 저장 파일명:", outputFileName);

      const outputFilePath = path.join(convertedPath, outputFileName);

      // 2) 변환 로직 (파일 유형별 처리)
      try {
        // (1) 래스터 이미지 → SVG
        if (
          [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/bmp",
            "image/tiff",
            "image/webp",
            "image/heic",
            "image/avif",
          ].includes(file.mimetype)
        ) {
          const tempPngPath = `${file.path}.png`;
          await sharp(file.path).png().toFile(tempPngPath);

          await new Promise((resolve, reject) => {
            potrace.trace(tempPngPath, (err, svg) => {
              if (err) return reject(err);
              fs.writeFileSync(outputFilePath, svg);
              fs.unlinkSync(tempPngPath); // 임시 PNG 삭제
              resolve();
            });
          });
        }

        // (2) PDF → SVG (pdf2pic 사용)
        else if (file.mimetype === "application/pdf") {
          // PDF → PNG
          const pdfOptions = {
            density: 100,
            savePath: convertedPath,
            format: "png",
            saveFilename: path.parse(file.filename).name,
            quality: 100,
          };

          try {
            const converter = fromPath(file.path, pdfOptions);
            // 첫 페이지만 변환할 건지, 모든 페이지 변환할 건지 결정
            // 여기서는 1페이지만 예시로 변환 (bulk(-1)은 전 페이지)
            await converter.convert(1);
          } catch (err) {
            console.error("❌ PDF → PNG 변환 실패:", err);
            throw err;
          }

          // pdf2pic이 생성한 "filename_1.png" 형태로 저장됨
          const tempPngPath = path.join(
            convertedPath,
            `${path.parse(file.filename).name}_1.png`
          );

          await new Promise((resolve, reject) => {
            potrace.trace(tempPngPath, (err, svg) => {
              if (err) return reject(err);
              fs.writeFileSync(outputFilePath, svg);
              // 필요하다면 tempPngPath 삭제
              resolve();
            });
          });
        }

        // (3) DOCX → SVG
        else if (
          file.mimetype ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          const result = await mammoth.extractRawText({ path: file.path });
          // 텍스트 -> PNG 변환 (단순 예시: 텍스트를 이미지로 간주)
          const textBuffer = Buffer.from(result.value, "utf-8");
          const tempPngPath = `${file.path}.png`;

          await sharp(textBuffer).png().toFile(tempPngPath);

          await new Promise((resolve, reject) => {
            potrace.trace(tempPngPath, (err, svg) => {
              if (err) return reject(err);
              fs.writeFileSync(outputFilePath, svg);
              fs.unlinkSync(tempPngPath);
              resolve();
            });
          });
        }

        // 변환 완료
        convertedFiles.push(`/download/${outputFileName}`);
        fileNames.push(finalNameWithoutUUID);
      } catch (error) {
        console.error("❌ 파일 변환 중 오류 발생:", error);
      }
    }

    // 변환 결과 응답
    return res.json({
      message: "파일 → SVG 변환 성공!",
      downloadUrls: convertedFiles,
      fileNames,
    });
  } catch (error) {
    console.error("❌ SVG 변환 중 오류 발생:", error);
    return res
      .status(500)
      .json({ message: "파일 변환 중 오류 발생", error: error.message });
  }
});

module.exports = router;
