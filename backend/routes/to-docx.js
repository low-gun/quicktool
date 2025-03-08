const express = require("express");
const fs = require("fs");
const path = require("path");
const { Document, Packer, Paragraph } = require("docx");
const textract = require("textract");
const pdfParse = require("pdf-parse");
const { upload } = require("../middlewares/multerConfig"); // 업로드 미들웨어

const router = express.Router();

// 허용된 파일 형식 (TXT, PDF)
const allowedFormats = [
  "text/plain", // .txt
  "application/pdf", // .pdf
];

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
    const outputFileName = `${path
      .parse(req.file.originalname)
      .name.replace(/[^a-zA-Z0-9-_]/g, "")}.docx`;
    const outputFilePath = `uploads/converted/${outputFileName}`;
    let extractedText = "";

    if (req.file.mimetype === "text/plain") {
      extractedText = fs.readFileSync(req.file.path, "utf-8");
    } else if (req.file.mimetype === "application/pdf") {
      const dataBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
    }

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [new Paragraph(extractedText)],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(outputFilePath, buffer);

    res.json({
      message: "파일 → DOCX 변환 성공!",
      downloadUrl: `/download/${outputFileName}`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "파일 변환 중 오류 발생", error: error.message });
  }
});

module.exports = router;
