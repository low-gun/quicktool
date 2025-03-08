const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { PDFDocument } = require("pdf-lib");
const mammoth = require("mammoth"); // DOCX 변환용
const textract = require("textract"); // TXT 변환용
const { upload } = require("../middlewares/multerConfig"); // 업로드 미들웨어

const router = express.Router();

// 허용된 파일 형식 (DOCX, TXT, HWP)
const allowedFormats = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "text/plain", // .txt
  "application/x-hwp", // .hwp
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
      .name.replace(/[^a-zA-Z0-9-_]/g, "")}.pdf`;
    const outputFilePath = `uploads/converted/${outputFileName}`;

    if (req.file.mimetype === "application/x-hwp") {
      // HWP → PDF 변환 (LibreOffice 사용)
      const command = `soffice --headless --convert-to pdf --outdir uploads/converted "${req.file.path}"`;
      exec(command, (error, stdout, stderr) => {
        if (error) {
          return res
            .status(500)
            .json({ message: "HWP 변환 중 오류 발생", error: stderr });
        }
        res.json({
          message: "HWP → PDF 변환 성공!",
          downloadUrl: `/download/${outputFileName}`,
        });
      });
      return;
    }

    // DOCX, TXT 처리
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    let extractedText = "";

    if (req.file.mimetype === "text/plain") {
      extractedText = fs.readFileSync(req.file.path, "utf-8");
    } else if (
      req.file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ path: req.file.path });
      extractedText = result.value;
    }

    page.drawText(extractedText, { x: 50, y: 750, maxWidth: 500 });

    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputFilePath, pdfBytes);

    res.json({
      message: "파일 → PDF 변환 성공!",
      downloadUrl: `/download/${outputFileName}`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "파일 변환 중 오류 발생", error: error.message });
  }
});

module.exports = router;
