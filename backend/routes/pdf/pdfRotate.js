// backend/routes/pdf/pdfRotate.js
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { upload } = require("../../middlewares/multerConfig");
const { PDFDocument } = require("pdf-lib");
const { getFinalFileName } = require("../../utils/convertFileName");

/**
 * POST /api/pdf/rotate
 * (실제로는 /api/pdf/rotate, 왜냐면 pdf/index.js + pdfRotate.js)
 * form-data:
 *   - file: single (PDF)
 *   - angle: (예: 90, 180, 270)
 */
router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ message: "PDF 파일이 업로드되지 않았습니다." });
  }

  try {
    console.log("✅ [PDF-Rotate] 업로드 파일명:", req.file.originalname);

    const angle = parseInt(req.body.angle, 10) || 0;

    const pdfBytes = fs.readFileSync(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // 모든 페이지 회전
    const pages = pdfDoc.getPages();
    for (const page of pages) {
      const rotation = page.getRotation().angle;
      // pdf-lib의 회전값은 객체. 여기선 angle만 써서 단순화
      page.setRotation(rotation + angle);
    }

    const rotatedPdfBytes = await pdfDoc.save();

    const convertedPath = path.join(__dirname, "../../uploads/converted/");
    if (!fs.existsSync(convertedPath)) {
      fs.mkdirSync(convertedPath, { recursive: true });
    }
    const { finalNameWithoutUUID, outputFileName } = getFinalFileName(
      req.file.originalname,
      ".pdf"
    );
    const outputFilePath = path.join(convertedPath, outputFileName);
    fs.writeFileSync(outputFilePath, rotatedPdfBytes);

    return res.json({
      message: "PDF 회전 성공!",
      downloadUrl: `/download/${outputFileName}`,
    });
  } catch (error) {
    console.error("❌ [PDF-Rotate] 오류:", error);
    return res
      .status(500)
      .json({ message: "PDF 회전 중 오류 발생", error: error.message });
  }
});

module.exports = router;
