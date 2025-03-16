const express = require("express");
const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph } = require("docx");
const pdfParse = require("pdf-parse");
const showdown = require("showdown");
const RTFParser = require("rtf-parser");
const { upload } = require("../../middlewares/multerConfig");
const { getFinalFileName } = require("../../utils/convertFileName"); // ⬅️ 공통 함수 임포트

const router = express.Router();

// ✅ 확장된 허용 파일 형식
const allowedFormats = [
  "text/plain", // .txt
  "application/pdf", // .pdf
  "text/markdown", // .md
  "text/html", // .html
  "text/csv", // .csv
  "application/rtf", // .rtf
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
];

// ✅ DOCX 변환 함수
const convertToDocx = async (file) => {
  const convertedPath = path.join(__dirname, "../../uploads/converted/");
  if (!fs.existsSync(convertedPath)) {
    fs.mkdirSync(convertedPath, { recursive: true });
  }

  console.log("✅ 원본 파일명:", file.originalname);

  // 1) 파일명 생성 (최종 .docx)
  const { finalNameWithoutUUID, outputFileName } = getFinalFileName(
    file.originalname,
    ".docx"
  );
  console.log("✅ 최종 저장 파일명:", outputFileName);

  const outputFilePath = path.join(convertedPath, outputFileName);

  // 2) 파일 내용 추출
  let extractedText = "";
  if (file.mimetype === "text/plain") {
    extractedText = fs.readFileSync(file.path, "utf-8");
  } else if (file.mimetype === "application/pdf") {
    const dataBuffer = fs.readFileSync(file.path);
    const pdfData = await pdfParse(dataBuffer);
    extractedText = pdfData.text;
  } else if (file.mimetype === "text/markdown") {
    const markdownText = fs.readFileSync(file.path, "utf-8");
    const converter = new showdown.Converter();
    extractedText = converter.makeHtml(markdownText);
  } else if (file.mimetype === "application/rtf") {
    const rtfData = fs.readFileSync(file.path, "utf-8");
    await new Promise((resolve, reject) => {
      RTFParser.string(rtfData, (err, doc) => {
        if (err) return reject(err);
        extractedText = doc.content;
        resolve();
      });
    });
  } else {
    throw new Error(`지원되지 않는 파일 형식입니다: ${file.mimetype}`);
  }

  // 3) docx 생성
  const doc = new Document({
    sections: [{ children: [new Paragraph(extractedText)] }],
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputFilePath, buffer);

  return { finalNameWithoutUUID, outputFileName };
};

router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
  }

  if (!allowedFormats.includes(req.file.mimetype)) {
    return res
      .status(400)
      .json({ message: `지원되지 않는 파일 형식입니다: ${req.file.mimetype}` });
  }

  try {
    const { finalNameWithoutUUID, outputFileName } = await convertToDocx(
      req.file
    );

    // 프론트가 표시할 최종 파일명 (finalNameWithoutUUID)을 함께 보낼 수도 있음
    return res.json({
      message: "파일 → DOCX 변환 성공!",
      downloadUrl: `/download/${outputFileName}`,
      fileName: finalNameWithoutUUID,
    });
  } catch (error) {
    console.error("❌ DOCX 변환 중 오류 발생:", error);
    return res
      .status(500)
      .json({ message: "파일 변환 중 오류 발생", error: error.message });
  }
});

module.exports = router;
