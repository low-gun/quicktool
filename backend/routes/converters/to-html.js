const express = require("express");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");
const pdfPoppler = require("pdf-poppler");
const { upload } = require("../../middlewares/multerConfig");
const { getFinalFileName } = require("../../utils/convertFileName"); // ⬅️ 공통 함수 임포트

const router = express.Router();

// ✅ 지원하는 파일 형식 (TXT, CSV, PDF)
const allowedFormats = [
  "text/plain", // .txt
  "text/csv", // .csv
  "application/pdf", // .pdf
];

router.post("/", upload.array("files"), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
  }

  const { conversionType } = req.body; // "text" 또는 "ocr"
  if (!["text", "ocr"].includes(conversionType)) {
    return res.status(400).json({
      message: "유효한 변환 방식을 선택해주세요 (text 또는 ocr)",
    });
  }

  try {
    const convertedFiles = [];
    const fileNames = []; // 프론트로 내려줄 파일명
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

      // 1) 최종 HTML 확장자 파일명 생성
      const { finalNameWithoutUUID, outputFileName } = getFinalFileName(
        file.originalname,
        ".html"
      );
      console.log("✅ 최종 저장 파일명:", outputFileName);

      const outputFilePath = path.join(convertedPath, outputFileName);
      let htmlContent = "<html><body>";

      // 2) TXT / CSV
      if (file.mimetype === "text/plain" || file.mimetype === "text/csv") {
        const textContent = fs.readFileSync(file.path, "utf-8");
        htmlContent += `<pre>${textContent}</pre>`;
      }
      // 3) PDF
      else if (file.mimetype === "application/pdf") {
        if (conversionType === "text") {
          // 텍스트 추출 방식
          const pdfData = await pdfParse(fs.readFileSync(file.path));
          const textPages = pdfData.text.split("\n\n");
          textPages.forEach((text) => {
            htmlContent += `<p>${text}</p>`;
          });
        } else if (conversionType === "ocr") {
          // OCR 방식
          const pdfImageDir = path.join(
            convertedPath,
            `${path.parse(file.filename).name}_pages/`
          );
          if (!fs.existsSync(pdfImageDir)) {
            fs.mkdirSync(pdfImageDir, { recursive: true });
          }

          const pdfOptions = {
            format: "jpeg",
            out_dir: pdfImageDir,
            out_prefix: path.parse(file.filename).name,
            page: null, // 모든 페이지 변환
          };

          await pdfPoppler.convert(file.path, pdfOptions);

          const imageFiles = fs
            .readdirSync(pdfImageDir)
            .filter((f) => f.endsWith(".jpg"));
          if (imageFiles.length === 0) {
            return res.status(500).json({ message: "PDF 페이지 변환 실패" });
          }

          for (const imageFile of imageFiles) {
            const imagePath = path.join(pdfImageDir, imageFile);
            // OCR 인식 (여기선 'kor' - 한글)
            const {
              data: { text },
            } = await Tesseract.recognize(imagePath, "kor");
            htmlContent += `<p>${text.trim()}</p>`;
          }
        }
      }

      htmlContent += "</body></html>";
      fs.writeFileSync(outputFilePath, htmlContent);

      convertedFiles.push(`/download/${outputFileName}`);
      fileNames.push(finalNameWithoutUUID);
    }

    return res.json({
      message: "파일 → HTML 변환 성공!",
      downloadUrls: convertedFiles,
      fileNames,
    });
  } catch (error) {
    console.error("❌ HTML 변환 중 오류 발생:", error);
    return res.status(500).json({
      message: "파일 변환 중 오류 발생",
      error: error.message,
    });
  }
});

module.exports = router;
