const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const textract = require("textract");
const pdfParse = require("pdf-parse");
const { upload } = require("../middlewares/multerConfig"); // 업로드 미들웨어

const router = express.Router();

// 허용된 파일 형식 (DOCX, PDF, HWP)
const allowedFormats = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "application/pdf", // .pdf
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
      .name.replace(/[^a-zA-Z0-9-_]/g, "")}.txt`;
    const outputFilePath = `uploads/converted/${outputFileName}`;
    let extractedText = "";

    if (req.file.mimetype === "application/x-hwp") {
      // HWP → TXT 변환 (LibreOffice 사용)
      const command = `soffice --headless --convert-to txt:Text --outdir uploads/converted "${req.file.path}"`;
      exec(command, (error, stdout, stderr) => {
        if (error) {
          return res
            .status(500)
            .json({ message: "HWP 변환 중 오류 발생", error: stderr });
        }
        res.json({
          message: "HWP → TXT 변환 성공!",
          downloadUrl: `/download/${outputFileName}`,
        });
      });
      return;
    }

    if (req.file.mimetype === "application/pdf") {
      const dataBuffer = fs.readFileSync(req.file.path);
      const pdfData = await pdfParse(dataBuffer);
      extractedText = pdfData.text;
    } else if (
      req.file.mimetype ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      extractedText = await new Promise((resolve, reject) => {
        textract.fromFileWithPath(req.file.path, (error, text) => {
          if (error) reject(error);
          resolve(text);
        });
      });
    }

    fs.writeFileSync(outputFilePath, extractedText, "utf8");

    res.json({
      message: "파일 → TXT 변환 성공!",
      downloadUrl: `/download/${outputFileName}`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "파일 변환 중 오류 발생", error: error.message });
  }
});

module.exports = router;
