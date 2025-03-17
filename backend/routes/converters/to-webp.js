const express = require("express");
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
// ❌ pdfPoppler 제거
// const pdfPoppler = require("pdf-poppler");
// ✅ pdf2pic 사용
const { fromPath } = require("pdf2pic");
const mammoth = require("mammoth");
const { upload } = require("../../middlewares/multerConfig");
const { getFinalFileName } = require("../../utils/convertFileName"); // ⬅️ 공통 함수 임포트

const router = express.Router();

// ✅ 확장된 허용 파일 형식 (WEBP 변환 가능)
const allowedFormats = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/bmp",
  "image/tiff",
  "image/webp",
  "image/heic", // (HEIC → WEBP)
  "image/avif", // (AVIF → WEBP)
  "application/pdf", // (PDF → WEBP)
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // (DOCX → WEBP)
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

      if (!allowedFormats.includes(file.mimetype)) {
        return res.status(400).json({
          message: `지원되지 않는 파일 형식입니다: ${file.mimetype}`,
        });
      }

      // 1) .webp 확장자로 최종 파일명 생성
      const { finalNameWithoutUUID, outputFileName } = getFinalFileName(
        file.originalname,
        ".webp"
      );
      console.log("✅ 최종 저장 파일명:", outputFileName);

      const outputFilePath = path.join(convertedPath, outputFileName);

      // 2) 변환 로직
      try {
        // 래스터 이미지 계열 (JPEG, PNG, GIF, BMP, TIFF, WEBP, AVIF)
        if (
          [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/bmp",
            "image/tiff",
            "image/webp",
            "image/avif",
          ].includes(file.mimetype)
        ) {
          await sharp(file.path).toFormat("webp").toFile(outputFilePath);
        }
        // PDF → WEBP (pdf2pic 사용)
        else if (file.mimetype === "application/pdf") {
          // 먼저 PDF를 PNG로 변환
          const pdfOptions = {
            density: 100,
            savePath: convertedPath,
            format: "png",
            saveFilename: path.parse(file.filename).name,
            quality: 100,
          };

          // 필요한 만큼 페이지를 변환 (여기선 첫 페이지만 예시)
          const converter = fromPath(file.path, pdfOptions);
          await converter.convert(1);

          // pdf2pic은 "filename_1.png" 같은 이름으로 생성
          const tempPngPath = path.join(
            convertedPath,
            `${path.parse(file.filename).name}_1.png`
          );

          // PNG → WEBP
          await sharp(tempPngPath).toFormat("webp").toFile(outputFilePath);

          // 필요하면 임시 PNG 삭제
          // fs.unlinkSync(tempPngPath);
        }
        // DOCX → WEBP (텍스트를 임시 PNG → WEBP)
        else if (
          file.mimetype ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
          const result = await mammoth.extractRawText({ path: file.path });
          const textBuffer = Buffer.from(result.value, "utf-8");
          const tempPngPath = `${file.path}.png`;

          // 텍스트 → PNG
          await sharp(textBuffer).png().toFile(tempPngPath);
          // PNG → WEBP
          await sharp(tempPngPath).toFormat("webp").toFile(outputFilePath);

          // 필요하면 임시 PNG 삭제
          // fs.unlinkSync(tempPngPath);
        }

        convertedFiles.push(`/download/${outputFileName}`);
        fileNames.push(finalNameWithoutUUID);
      } catch (error) {
        console.error("❌ 파일 변환 중 오류 발생:", error);
      }
    }

    // 3) 응답
    return res.json({
      message: "파일 → WEBP 변환 성공!",
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
