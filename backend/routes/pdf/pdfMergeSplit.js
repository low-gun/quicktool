// backend/routes/pdf/pdfMergeSplit.js
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const { upload } = require("../../middlewares/multerConfig");
const { PDFDocument } = require("pdf-lib");
const { getFinalFileName } = require("../../utils/convertFileName");

/**
 * POST /api/pdf/merge-split
 * form-data:
 *   - mode: "merge" or "split"
 *   - files: PDF(s)
 *   - etc. (page ranges) optional
 */
router.post("/", upload.array("files"), async (req, res) => {
  const { mode } = req.body;
  const files = req.files;

  if (!files || files.length === 0) {
    return res
      .status(400)
      .json({ message: "PDF 파일이 업로드되지 않았습니다." });
  }

  try {
    console.log("✅ [PDF-MergeSplit] mode:", mode, ", files:", files.length);
    const convertedPath = path.join(__dirname, "../../uploads/converted/");
    if (!fs.existsSync(convertedPath)) {
      fs.mkdirSync(convertedPath, { recursive: true });
    }

    if (mode === "merge") {
      // 병합 로직
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const pdfBytes = fs.readFileSync(file.path);
        const tempPdf = await PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(
          tempPdf,
          tempPdf.getPageIndices()
        );
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const mergedBytes = await mergedPdf.save();

      const outputFileName = `merged_${Date.now()}.pdf`;
      const outputFilePath = path.join(convertedPath, outputFileName);
      fs.writeFileSync(outputFilePath, mergedBytes);

      return res.json({
        message: "PDF 병합 성공!",
        downloadUrl: `/download/${outputFileName}`,
      });
    } else if (mode === "split") {
      // 분할 로직
      if (files.length > 1) {
        return res
          .status(400)
          .json({ message: "분할은 1개의 PDF만 업로드하세요." });
      }
      const pdfBytes = fs.readFileSync(files[0].path);
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const totalPages = pdfDoc.getPageCount();

      const downloadUrls = [];
      for (let i = 0; i < totalPages; i++) {
        const newPdf = await PDFDocument.create();
        const [copiedPage] = await newPdf.copyPages(pdfDoc, [i]);
        newPdf.addPage(copiedPage);
        const splitBytes = await newPdf.save();

        const outputFileName = `split_page_${i + 1}_${Date.now()}.pdf`;
        const outputFilePath = path.join(convertedPath, outputFileName);
        fs.writeFileSync(outputFilePath, splitBytes);

        downloadUrls.push(`/download/${outputFileName}`);
      }
      return res.json({
        message: "PDF 분할 성공!",
        downloadUrls,
      });
    } else {
      return res
        .status(400)
        .json({
          message: 'mode 파라미터가 "merge" 또는 "split" 이어야 합니다.',
        });
    }
  } catch (error) {
    console.error("❌ [PDF-MergeSplit] 오류:", error);
    return res.status(500).json({
      message: "PDF 병합/분할 중 오류 발생",
      error: error.message,
    });
  }
});

module.exports = router;
