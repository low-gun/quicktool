const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const textract = require("textract");
const pdfParse = require("pdf-parse");
const rtfParser = require("rtf-parser");
const csvParser = require("csv-parser");
const epubParser = require("epub-parser");
const { upload } = require("../../middlewares/multerConfig");
const { getFinalFileName } = require("../../utils/convertFileName"); // ⬅️ 공통 함수 임포트

const router = express.Router();

// ✅ 확장된 허용 파일 형식 (TXT 변환 가능)
const allowedFormats = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/pdf", // .pdf
  "application/x-hwp", // .hwp
  "application/rtf", // RTF
  "text/csv", // CSV
  "application/epub+zip", // EPUB
];

// 변환 함수
const convertToTxt = async (file) => {
  const convertedPath = path.join(__dirname, "../../uploads/converted/");
  if (!fs.existsSync(convertedPath)) {
    fs.mkdirSync(convertedPath, { recursive: true });
  }

  console.log("✅ 원본 파일명:", file.originalname);

  // 1) ".txt" 확장자로 최종 파일명 생성
  const { finalNameWithoutUUID, outputFileName } = getFinalFileName(
    file.originalname,
    ".txt"
  );
  console.log("✅ 최종 저장 파일명:", outputFileName);

  const outputFilePath = path.join(convertedPath, outputFileName);

  let extractedText = "";

  // ───────────────────────────────────────────────────
  // (1) HWP → TXT (LibreOffice)
  if (file.mimetype === "application/x-hwp") {
    return new Promise((resolve, reject) => {
      const command = `soffice --headless --convert-to txt:Text --outdir "${convertedPath}" "${file.path}"`;
      exec(command, (error, stdout, stderr) => {
        if (error) return reject(stderr);
        // LibreOffice가 만들어준 .txt 파일명이 자동 생성 -> 필요시 rename
        resolve(outputFileName);
      });
    });
  }

  // ───────────────────────────────────────────────────
  // (2) PDF → TXT
  if (file.mimetype === "application/pdf") {
    const dataBuffer = fs.readFileSync(file.path);
    const pdfData = await pdfParse(dataBuffer);
    extractedText = pdfData.text;
  }

  // ───────────────────────────────────────────────────
  // (3) DOCX → TXT
  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    extractedText = await new Promise((resolve, reject) => {
      textract.fromFileWithPath(file.path, (error, text) => {
        if (error) return reject(error);
        resolve(text);
      });
    });
  }

  // ───────────────────────────────────────────────────
  // (4) RTF → TXT
  if (file.mimetype === "application/rtf") {
    extractedText = await new Promise((resolve, reject) => {
      rtfParser.string(fs.readFileSync(file.path, "utf-8"), (err, doc) => {
        if (err) return reject(err);
        resolve(doc.content);
      });
    });
  }

  // ───────────────────────────────────────────────────
  // (5) CSV → TXT
  if (file.mimetype === "text/csv") {
    // 단순히 CSV의 ','를 공백으로 치환
    extractedText = fs.readFileSync(file.path, "utf-8").replace(/,/g, " ");
  }

  // ───────────────────────────────────────────────────
  // (6) EPUB → TXT
  if (file.mimetype === "application/epub+zip") {
    extractedText = await new Promise((resolve, reject) => {
      epubParser.open(file.path, (err, epubData) => {
        if (err) return reject(err);
        const combined = epubData.flow
          .map((section) => section.content.replace(/<[^>]*>?/gm, ""))
          .join("\n");
        resolve(combined);
      });
    });
  }

  // 2) 추출된 텍스트를 .txt 파일로 저장
  fs.writeFileSync(outputFilePath, extractedText, "utf8");
  return outputFileName;
};

// ─────────────────────────────────────────────────────
// 라우트
router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
  }

  if (!allowedFormats.includes(req.file.mimetype)) {
    return res.status(400).json({
      message: `지원되지 않는 파일 형식입니다: ${req.file.mimetype}`,
    });
  }

  try {
    const outputFileName = await convertToTxt(req.file);
    return res.json({
      message: "파일 → TXT 변환 성공!",
      downloadUrl: `/download/${outputFileName}`,
      // fileName: finalNameWithoutUUID,  // (필요 시 프론트 표시용으로 추가)
    });
  } catch (error) {
    console.error("❌ TXT 변환 중 오류 발생:", error);
    return res
      .status(500)
      .json({ message: "파일 변환 중 오류 발생", error: error.message });
  }
});

module.exports = router;
