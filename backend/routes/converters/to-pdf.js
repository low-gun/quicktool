const express = require("express");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const { PDFDocument } = require("pdf-lib");
const mammoth = require("mammoth");
const textract = require("textract");
const sharp = require("sharp");
const pdfPoppler = require("pdf-poppler");
const showdown = require("showdown");
const svg2img = require("svg2img");
const pdfkit = require("pdfkit");
const epubParser = require("epub-parser");
const { upload } = require("../../middlewares/multerConfig");
const { getFinalFileName } = require("../../utils/convertFileName"); // ⬅️ 공통 함수 임포트

const router = express.Router();

// ✅ 확장된 허용 파일 형식
const allowedFormats = [
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
  "text/plain", // .txt
  "application/x-hwp", // .hwp
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/bmp",
  "image/tiff",
  "image/webp",
  "image/svg+xml",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/markdown",
  "text/html",
  "text/csv",
  "application/rtf",
  "application/epub+zip",
];

// ✅ 변환 함수
const convertToPdf = async (file) => {
  const convertedPath = path.join(__dirname, "../../uploads/converted/");
  if (!fs.existsSync(convertedPath)) {
    fs.mkdirSync(convertedPath, { recursive: true });
  }

  console.log("✅ 원본 파일명:", file.originalname);

  // 1) ".pdf" 확장자로 최종 파일명 생성
  const { finalNameWithoutUUID, outputFileName } = getFinalFileName(
    file.originalname,
    ".pdf"
  );
  console.log("✅ 최종 저장 파일명:", outputFileName);

  const outputFilePath = path.join(convertedPath, outputFileName);

  // 2) 파일 형식에 따른 변환 로직
  // ──────────────────────────────────────────────────────
  // HWP (LibreOffice)
  if (file.mimetype === "application/x-hwp") {
    return new Promise((resolve, reject) => {
      const command = `soffice --headless --convert-to pdf --outdir "${convertedPath}" "${file.path}"`;
      exec(command, (error, stdout, stderr) => {
        if (error) return reject(stderr);

        // LibreOffice가 만든 .pdf 파일명을 찾아서 uuid_... 형태로 이름 변경 필요
        // ex: file.path= /uploads/original/test.hwp => test.pdf
        // 아래는 단순 예시 (이름 맞추고 싶다면 추가로 fs.renameSync 필요)
        // 여기서는 그냥 LibreOffice가 생성한 PDF 파일명 그대로 사용 가능
        resolve(outputFileName);
      });
    });
  }

  // ──────────────────────────────────────────────────────
  // 이미 PDF라면 복사
  if (file.mimetype === "application/pdf") {
    fs.copyFileSync(file.path, outputFilePath);
    return outputFileName;
  }

  // ──────────────────────────────────────────────────────
  // 이미지 → PDF
  if (
    [
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/bmp",
      "image/tiff",
      "image/webp",
    ].includes(file.mimetype)
  ) {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const imageBuffer = fs.readFileSync(file.path);

    // PNG, JPEG 등 처리. gif/webp도 임시로 embedPng 시도 (실무에선 webp->png 변환할 수도)
    const pdfImage = await pdfDoc.embedPng(imageBuffer).catch(async () => {
      // fallback: Sharp로 PNG 변환 후 embed
      const pngBuffer = await sharp(imageBuffer).png().toBuffer();
      return pdfDoc.embedPng(pngBuffer);
    });

    page.drawImage(pdfImage, { x: 50, y: 50, width: 500, height: 700 });
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputFilePath, pdfBytes);
    return outputFileName;
  }

  // ──────────────────────────────────────────────────────
  // SVG → PDF
  if (file.mimetype === "image/svg+xml") {
    await new Promise((resolve, reject) => {
      svg2img(file.path, (error, buffer) => {
        if (error) return reject(error);
        // buffer=PNG
        const tempPng = `${file.path}.png`;
        fs.writeFileSync(tempPng, buffer);

        sharp(tempPng)
          .toFormat("pdf")
          .toFile(outputFilePath)
          .then(() => {
            fs.unlinkSync(tempPng);
            resolve();
          })
          .catch(reject);
      });
    });
    return outputFileName;
  }

  // ──────────────────────────────────────────────────────
  // EPUB → PDF
  if (file.mimetype === "application/epub+zip") {
    return new Promise((resolve, reject) => {
      epubParser.open(file.path, (err, epubData) => {
        if (err) return reject(err);

        const doc = new pdfkit();
        const writeStream = fs.createWriteStream(outputFilePath);
        doc.pipe(writeStream);

        epubData.flow.forEach((section, idx) => {
          doc.text(section.content.replace(/<[^>]*>?/gm, ""), {
            width: 500,
          });
          if (idx < epubData.flow.length - 1) {
            doc.addPage(); // 섹션별 페이지 구분
          }
        });
        doc.end();
        writeStream.on("finish", () => resolve(outputFileName));
      });
    });
  }

  // ──────────────────────────────────────────────────────
  // TXT
  if (file.mimetype === "text/plain") {
    const text = fs.readFileSync(file.path, "utf-8");
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    page.drawText(text, { x: 50, y: 750, maxWidth: 500 });
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputFilePath, pdfBytes);
    return outputFileName;
  }

  // ──────────────────────────────────────────────────────
  // DOCX → PDF
  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const result = await mammoth.extractRawText({ path: file.path });
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    page.drawText(result.value, { x: 50, y: 750, maxWidth: 500 });
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(outputFilePath, pdfBytes);
    return outputFileName;
  }

  // ──────────────────────────────────────────────────────
  throw new Error(`지원되지 않는 파일 형식입니다: ${file.mimetype}`);
};

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
    const outputFileName = await convertToPdf(req.file);
    // 프론트에 표시할 최종 이름( uuid 제거된 파일명 )도 넘겨주고 싶다면:
    //   getFinalFileName() 반환값 구조를 조금 바꾸거나
    //   여기서 중간에 구해둔 finalNameWithoutUUID를 함께 반환하도록 조정
    return res.json({
      message: "파일 → PDF 변환 성공!",
      downloadUrl: `/download/${outputFileName}`,
      // fileName: finalNameWithoutUUID,
    });
  } catch (error) {
    console.error("❌ PDF 변환 중 오류 발생:", error);
    return res
      .status(500)
      .json({ message: "파일 변환 중 오류 발생", error: error.message });
  }
});

module.exports = router;
