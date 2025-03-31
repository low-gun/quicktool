// backend/routes/pdf/pdfWatermark.js
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { upload } = require("../../middlewares/multerConfig");
const { PDFDocument, StandardFonts } = require("pdf-lib");
const { getFinalFileName } = require("../../utils/convertFileName");

/**
 * POST /api/pdf/watermark
 * form-data:
 *   - file: single PDF
 *   - text: 워터마크 문자열
 */
router.post("/", upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res
      .status(400)
      .json({ message: "PDF 파일이 업로드되지 않았습니다." });
  }

  try {
    console.log("✅ [PDF-Watermark] 파일명:", req.file.originalname);

    const watermarkText = req.body.text || "WATERMARK";
    const pdfBytes = fs.readFileSync(req.file.path);
    const pdfDoc = await PDFDocument.load(pdfBytes);

    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();

    for (const page of pages) {
      const { width, height } = page.getSize();
      // 중앙에 빨간 투명 텍스트
      page.drawText(watermarkText, {
        x: width / 2 - 50,
        y: height / 2,
        size: 40,
        font,
        color: { red: 1, green: 0, blue: 0, alpha: 0.3 },
      });
    }

    const watermarkedBytes = await pdfDoc.save();

    const convertedPath = path.join(__dirname, "../../uploads/converted/");
    if (!fs.existsSync(convertedPath)) {
      fs.mkdirSync(convertedPath, { recursive: true });
    }
    const { finalNameWithoutUUID, outputFileName } = getFinalFileName(
      req.file.originalname,
      ".pdf"
    );
    const outputFilePath = path.join(convertedPath, outputFileName);
    fs.writeFileSync(outputFilePath, watermarkedBytes);

    return res.json({
      message: "PDF 워터마크 성공!",
      downloadUrl: `/download/${outputFileName}`,
    });
  } catch (error) {
    console.error("❌ [PDF-Watermark] 오류:", error);
    return res.status(500).json({
      message: "PDF 워터마크 중 오류 발생",
      error: error.message,
    });
  }
});

module.exports = router;
