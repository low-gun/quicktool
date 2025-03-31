// backend/routes/pdf/pdfEncrypt.js

const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { upload } = require("../../middlewares/multerConfig");
const { getFinalFileName } = require("../../utils/convertFileName");
const { execSync } = require("child_process");

/**
 * POST /api/pdf/encrypt
 * form-data:
 *   - file: single (PDF)
 *   - password: 비밀번호
 * (qpdf CLI 필요)
 */
router.post("/", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ message: "PDF 파일이 업로드되지 않았습니다." });
    }

    const password = req.body.password || "1234";
    console.log("✅ [PDF-Encrypt] 파일명:", req.file.originalname);

    const convertedPath = path.join(__dirname, "../../uploads/converted/");
    if (!fs.existsSync(convertedPath))
      fs.mkdirSync(convertedPath, { recursive: true });

    const { finalNameWithoutUUID, outputFileName } = getFinalFileName(
      req.file.originalname,
      ".pdf"
    );
    const outputPdfPath = path.join(convertedPath, outputFileName);

    // qpdf 설치되어 있어야: brew install qpdf or apt-get install qpdf
    execSync(
      `qpdf --encrypt ${password} ${password} 128 -- "${req.file.path}" "${outputPdfPath}"`
    );

    return res.json({
      message: "PDF 암호화 완료!",
      downloadUrl: `/download/${outputFileName}`,
    });
  } catch (error) {
    console.error("❌ [PDF-Encrypt] 오류:", error);
    return res.status(500).json({
      message: "PDF 암호화 중 오류 발생",
      error: error.message,
    });
  }
});

module.exports = router;
