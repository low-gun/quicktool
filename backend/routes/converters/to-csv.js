const express = require("express");
const fs = require("fs");
const path = require("path");
const { Parser } = require("json2csv");
const yaml = require("js-yaml");
const { upload } = require("../../middlewares/multerConfig");
const { getFinalFileName } = require("../../utils/convertFileName"); // ⬅️ 공통 함수 임포트

const router = express.Router();

// ✅ 지원하는 파일 형식 (CSV 변환 가능)
const allowedFormats = [
  "application/json",
  "application/xml",
  "application/x-yaml",
];

router.post("/", upload.array("files"), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
  }

  try {
    const convertedFiles = [];
    const fileNames = []; // 프론트로 내려줄 파일명 목록
    const convertedPath = path.join(__dirname, "../../uploads/converted/");

    if (!fs.existsSync(convertedPath)) {
      fs.mkdirSync(convertedPath, { recursive: true });
    }

    for (const file of req.files) {
      console.log("✅ 원본 파일명:", file.originalname);

      if (!allowedFormats.includes(file.mimetype)) {
        return res
          .status(400)
          .json({ message: `지원되지 않는 파일 형식입니다: ${file.mimetype}` });
      }

      // 1) 파일 내용 읽기
      const content = fs.readFileSync(file.path, "utf-8");
      let convertedData = "";

      // 2) JSON / YAML만 CSV로 파싱 (XML은 미구현)
      if (file.mimetype === "application/json") {
        const jsonContent = JSON.parse(content);
        const parser = new Parser();
        convertedData = parser.parse(jsonContent);
      } else if (file.mimetype === "application/x-yaml") {
        const jsonContent = yaml.load(content);
        const parser = new Parser();
        convertedData = parser.parse(jsonContent);
      } else {
        // application/xml은 변환 로직이 없어,
        // 필요시 xml2js 등 라이브러리로 파싱 후 CSV 변환 추가
        convertedData = content;
      }

      // 3) 공통 함수로 최종 파일명 생성 (.csv)
      const { finalNameWithoutUUID, outputFileName } = getFinalFileName(
        file.originalname,
        ".csv"
      );
      console.log("✅ 최종 저장 파일명:", outputFileName);

      // 4) 변환된 CSV 파일 저장
      fs.writeFileSync(path.join(convertedPath, outputFileName), convertedData);

      // 5) 응답 데이터
      convertedFiles.push(`/download/${outputFileName}`);
      fileNames.push(finalNameWithoutUUID);
    }

    return res.json({
      message: "파일 → CSV 변환 성공!",
      downloadUrls: convertedFiles,
      fileNames,
    });
  } catch (error) {
    console.error("❌ CSV 변환 중 오류 발생:", error);
    return res
      .status(500)
      .json({ message: "CSV 변환 중 오류 발생", error: error.message });
  }
});

module.exports = router;
