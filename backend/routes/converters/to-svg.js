const express = require("express");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const potrace = require("potrace");
const pdfPoppler = require("pdf-poppler");
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
              // 임시 PNG 삭제 가능
              fs.unlinkSync(tempPngPath);
              resolve();
            });
          });
        }

        // (2) PDF → SVG
        else if (file.mimetype === "application/pdf") {
          const pdfOptions = {
            format: "png",
            out_dir: convertedPath,
            out_prefix: path.parse(file.filename).name,
          };
          await pdfPoppler.convert(file.path, pdfOptions);

          // pdf-poppler가 "filename-1.png" 등으로 생성
          const tempPngPath = path.join(
            convertedPath,
            `${path.parse(file.filename).name}-1.png`
          );

          await new Promise((resolve, reject) => {
            potrace.trace(tempPngPath, (err, svg) => {
              if (err) return reject(err);
              fs.writeFileSync(outputFilePath, svg);
              // 필요하다면 tempPngPath도 삭제
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
          // 텍스트 -> PNG 변환
          const textBuffer = Buffer.from(result.value, "utf-8");
          const tempPngPath = `${file.path}.png`;

          await sharp(textBuffer).png().toFile(tempPngPath);

          await new Promise((resolve, reject) => {
            potrace.trace(tempPngPath, (err, svg) => {
              if (err) return reject(err);
              fs.writeFileSync(outputFilePath, svg);
              // tempPngPath 삭제
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
