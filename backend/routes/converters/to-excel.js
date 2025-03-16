const express = require("express");
const fs = require("fs");
const path = require("path");
const ExcelJS = require("exceljs");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");
const pdfPoppler = require("pdf-poppler");
const { upload } = require("../../middlewares/multerConfig");
const { getFinalFileName } = require("../../utils/convertFileName"); // ⬅️ 공통 함수 임포트

const router = express.Router();

// ✅ 지원하는 파일 형식 (TXT, CSV, PDF)
const allowedFormats = ["text/plain", "text/csv", "application/pdf"];

router.post("/", upload.single("file"), async (req, res) => {
  console.log("✅ 변환 요청 수신! 요청 타입:", req.headers["content-type"]);

  if (!req.file) {
    console.error("❌ 400 오류: 파일이 업로드되지 않음");
    console.log("✅ 요청 본문 데이터:", req.body);
    return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
  }
  console.log("✅ 업로드된 파일 이름:", req.file.originalname);

  const { conversionType } = req.body;
  console.log("✅ 변환 방식 확인:", conversionType);

  if (!["text", "ocr"].includes(conversionType)) {
    console.error("❌ 400 오류: 변환 방식이 전달되지 않음");
    return res
      .status(400)
      .json({ message: "유효한 변환 방식을 선택해주세요 (text 또는 ocr)" });
  }

  try {
    const convertedPath = path.join(__dirname, "../../uploads/converted/");
    if (!fs.existsSync(convertedPath)) {
      fs.mkdirSync(convertedPath, { recursive: true });
    }
    console.log("✅ 변환 폴더 확인:", convertedPath);
    console.log("✅ 원본 파일명:", req.file.originalname);

    // 1) Excel 확장자로 최종 파일명 생성 (.xlsx)
    const { finalNameWithoutUUID, outputFileName } = getFinalFileName(
      req.file.originalname,
      ".xlsx"
    );
    console.log("✅ 최종 저장 파일명:", outputFileName);

    const outputFilePath = path.join(convertedPath, outputFileName);

    // pdfPoppler로 PDF 페이지 이미지를 추출할 때 쓰는 디렉토리 이름 필요
    // => "파일이름" 부분만 쓰면 됨 (.xlsx 제거)
    const sanitizedBase = path.basename(finalNameWithoutUUID, ".xlsx");
    const pdfImageDir = path.join(convertedPath, `${sanitizedBase}_pages/`);

    // 2) 새 엑셀 Workbook 생성
    let workbook = new ExcelJS.Workbook();
    let worksheet = workbook.addWorksheet("Sheet 1");

    // 3) 파일 형식에 따라 텍스트 뽑아내서 엑셀에 기록
    if (
      req.file.mimetype === "text/plain" ||
      req.file.mimetype === "text/csv"
    ) {
      console.log("✅ TXT 또는 CSV → Excel 변환 시작");
      const textContent = fs.readFileSync(req.file.path, "utf-8");
      const lines = textContent.split("\n");
      lines.forEach((line) => {
        worksheet.addRow([line]);
      });
    } else if (req.file.mimetype === "application/pdf") {
      if (conversionType === "text") {
        console.log("✅ PDF → Excel 변환 시작 (텍스트 기반)");
        try {
          const pdfData = await pdfParse(fs.readFileSync(req.file.path));
          const textPages = pdfData.text.split("\n\n");
          if (textPages.length === 0) {
            console.error("❌ 변환 실패: 추출된 텍스트 없음");
            return res
              .status(500)
              .json({ message: "PDF에서 텍스트를 추출할 수 없습니다." });
          }
          textPages.forEach((text) => {
            worksheet.addRow([text]);
          });
        } catch (error) {
          console.error("❌ PDF → 텍스트 변환 실패:", error);
          return res.status(500).json({
            message: "PDF → 텍스트 변환 중 오류 발생",
            error: error.message,
          });
        }
      } else if (conversionType === "ocr") {
        console.log("✅ PDF → Excel 변환 시작 (OCR 기반)");
        if (!fs.existsSync(pdfImageDir)) {
          fs.mkdirSync(pdfImageDir, { recursive: true });
        }

        const pdfOptions = {
          format: "jpeg",
          out_dir: pdfImageDir,
          out_prefix: sanitizedBase, // 예: "내문서_pages/내문서"
          page: null, // 모든 페이지 변환
        };

        try {
          // PDF → JPG(s)
          await pdfPoppler.convert(req.file.path, pdfOptions);
        } catch (error) {
          console.error("❌ PDF 페이지 변환 실패:", error);
          return res.status(500).json({
            message: "PDF → 이미지 변환 중 오류 발생",
            error: error.message,
          });
        }

        // 추출된 이미지들에 대해 OCR 수행
        const imageFiles = fs
          .readdirSync(pdfImageDir)
          .filter((f) => f.endsWith(".jpg"));
        if (imageFiles.length === 0) {
          console.error("❌ 변환 실패: 이미지 파일 없음");
          return res.status(500).json({ message: "PDF 페이지 변환 실패" });
        }

        for (const imageFile of imageFiles) {
          try {
            const imagePath = path.join(pdfImageDir, imageFile);
            const {
              data: { text },
            } = await Tesseract.recognize(imagePath, "eng");

            if (!text.trim()) {
              console.error(
                `❌ OCR 실패: ${imageFile}에서 텍스트를 추출하지 못함`
              );
              return res
                .status(500)
                .json({ message: `OCR 변환 실패: ${imageFile}` });
            }
            worksheet.addRow([text.trim()]);
          } catch (error) {
            console.error("❌ OCR 변환 중 오류 발생:", error);
            return res
              .status(500)
              .json({ message: "OCR 변환 중 오류 발생", error: error.message });
          }
        }
      }
    }

    // 4) 엑셀 파일로 저장
    await workbook.xlsx.writeFile(outputFilePath);

    // 5) 응답
    return res.json({
      message: "파일 → Excel 변환 성공!",
      downloadUrls: [`/download/${outputFileName}`],
      fileNames: [finalNameWithoutUUID], // 프론트 표시용
    });
  } catch (error) {
    console.error("❌ Excel 변환 중 오류 발생:", error);
    return res
      .status(500)
      .json({ message: "파일 변환 중 오류 발생", error: error.message });
  }
});

module.exports = router;
