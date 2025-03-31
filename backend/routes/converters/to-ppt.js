const express = require("express");
const fs = require("fs");
const path = require("path");
// ❌ pdfPoppler 제거
// const pdfPoppler = require("pdf-poppler");
// ✅ pdf2pic 사용
const { fromPath } = require("pdf2pic");
const pdfParse = require("pdf-parse");
const pptxgen = require("pptxgenjs");
const { upload } = require("../../middlewares/multerConfig");
const { getFinalFileName } = require("../../utils/convertFileName"); // ⬅️ 공통 함수 임포트

const router = express.Router();

const allowedFormats = ["application/pdf"];

// ✅ 변환 방식 선택 (디자인 유지 vs 텍스트 변환)
router.post("/", upload.single("file"), async (req, res) => {
  console.log("✅ 변환 요청 수신! 요청 타입:", req.headers["content-type"]);
  console.log("✅ 요청된 데이터:", req.body);
  console.log("✅ 업로드된 파일 정보:", req.file);

  if (!req.file) {
    console.error("❌ 400 오류: 파일이 업로드되지 않음");
    console.log("✅ 요청 본문 데이터:", req.body);
    return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
  }

  const { conversionType } = req.body; // "image" or "text"
  console.log("✅ 변환 방식 확인:", conversionType);

  if (!["image", "text"].includes(conversionType)) {
    console.error("❌ 400 오류: 변환 방식이 전달되지 않음");
    return res.status(400).json({
      message: "유효한 변환 방식을 선택해주세요 (image 또는 text)",
    });
  }

  // PDF 형식인지 체크
  if (!allowedFormats.includes(req.file.mimetype)) {
    return res.status(400).json({
      message: `지원되지 않는 파일 형식입니다: ${req.file.mimetype}`,
    });
  }

  try {
    const convertedPath = path.join(__dirname, "../../uploads/converted/");
    if (!fs.existsSync(convertedPath)) {
      fs.mkdirSync(convertedPath, { recursive: true });
    }

    console.log("✅ 변환 폴더 확인:", convertedPath);
    console.log("✅ 원본 파일명:", req.file.originalname);

    // 1) .pptx 확장자로 최종 파일명 생성
    const { finalNameWithoutUUID, outputFileName } = getFinalFileName(
      req.file.originalname,
      ".pptx"
    );
    console.log("✅ 최종 저장 파일명:", outputFileName);

    const outputFilePath = path.join(convertedPath, outputFileName);

    // 2) PPTX 생성
    let pptx = new pptxgen();

    // 3) 변환 방식에 따라 처리
    if (conversionType === "image") {
      console.log("✅ PDF → 이미지 → PPT 변환 (디자인 유지) 시작");
      const pdfImageDir = path.join(
        convertedPath,
        `${finalNameWithoutUUID}_pages/`
      );
      if (!fs.existsSync(pdfImageDir)) {
        fs.mkdirSync(pdfImageDir, { recursive: true });
      }

      // pdf2pic 옵션
      const pdfOptions = {
        density: 80,
        savePath: pdfImageDir,
        format: "jpg",
        saveFilename: finalNameWithoutUUID,
        quality: 80,
      };

      try {
        const converter = fromPath(req.file.path, pdfOptions);
        // 모든 페이지 변환
        await converter.bulk(-1);
      } catch (error) {
        console.error("❌ PDF 페이지 변환 실패:", error);
        return res.status(500).json({
          message: "PDF 페이지 변환 중 오류 발생",
          error: error.message,
        });
      }

      const imageFiles = fs
        .readdirSync(pdfImageDir)
        .filter((f) => f.endsWith(".jpg"));
      if (imageFiles.length === 0) {
        console.error("❌ 변환 실패: 이미지 파일 없음");
        return res.status(500).json({ message: "PDF 페이지 변환 실패" });
      }

      // 페이지 이미지들을 PPT 슬라이드로 삽입
      for (const imageFile of imageFiles) {
        let slide = pptx.addSlide();
        slide.addImage({
          path: path.join(pdfImageDir, imageFile),
          x: 0.5,
          y: 0.5,
          w: 9,
          h: 6,
        });
      }
    } else if (conversionType === "text") {
      console.log("✅ PDF → 텍스트 → PPT 변환 시작");
      try {
        const pdfData = await pdfParse(fs.readFileSync(req.file.path));
        const textPages = pdfData.text.split("\n\n");

        if (textPages.length === 0) {
          console.error("❌ 변환 실패: 추출된 텍스트 없음");
          return res
            .status(500)
            .json({ message: "PDF에서 텍스트를 추출할 수 없습니다." });
        }

        // 텍스트 블록마다 PPT 슬라이드 추가
        for (const pageText of textPages) {
          let slide = pptx.addSlide();
          slide.addText(pageText, {
            x: 0.5,
            y: 0.5,
            fontSize: 18,
            color: "363636",
            w: 9,
            h: 6,
          });
        }
      } catch (error) {
        console.error("❌ PDF → 텍스트 변환 실패:", error);
        return res.status(500).json({
          message: "PDF → 텍스트 변환 중 오류 발생",
          error: error.message,
        });
      }
    }

    // 4) PPTX 파일 저장
    await pptx.writeFile({ fileName: outputFilePath });

    // 5) 응답
    return res.json({
      message: "PDF → PPT 변환 성공!",
      // 프론트에서 여러 파일로 받는 형태를 맞추기 위해 downloadUrls 배열 사용
      downloadUrls: [`/download/${outputFileName}`],
      fileNames: [finalNameWithoutUUID], // (선택) 프론트에서 표시할 이름
    });
  } catch (error) {
    console.error("❌ PDF → PPT 변환 중 오류 발생:", error);
    return res
      .status(500)
      .json({ message: "파일 변환 중 오류 발생", error: error.message });
  }
});

module.exports = router;
