const express = require("express");
const fs = require("fs");
const path = require("path");
const { Builder } = require("xml2js");
const yaml = require("js-yaml");
const { upload } = require("../../middlewares/multerConfig");
const { getFinalFileName } = require("../../utils/convertFileName"); // ⬅️ 공통 함수 임포트

const router = express.Router();

// ✅ 지원하는 파일 형식 (XML 변환 가능)
const allowedFormats = [
  "application/json",
  "text/csv", // CSV → XML 시, 간단한 처리 로직 추가 필요
  "application/x-yaml",
];

router.post("/", upload.array("files"), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
  }

  try {
    const convertedFiles = [];
    const fileNames = [];
    const convertedPath = path.join(__dirname, "../../uploads/converted/");

    if (!fs.existsSync(convertedPath)) {
      fs.mkdirSync(convertedPath, { recursive: true });
    }

    for (const file of req.files) {
      console.log("✅ 원본 파일명:", file.originalname);

      if (!allowedFormats.includes(file.mimetype)) {
        return res.status(400).json({
          message: `지원되지 않는 파일 형식입니다: ${file.mimetype}`,
        });
      }

      // 1) 파일 내용 읽기
      const content = fs.readFileSync(file.path, "utf-8");
      let convertedData = "";
      const builder = new Builder();

      // 2) JSON → XML
      if (file.mimetype === "application/json") {
        const jsonContent = JSON.parse(content);
        convertedData = builder.buildObject(jsonContent);
      }
      // 3) CSV → XML (간단 예: CSV -> JSON -> XML)
      else if (file.mimetype === "text/csv") {
        const lines = content.split("\n");
        const headers = lines[0].split(",");
        const arr = lines.slice(1).map((line) => {
          const cols = line.split(",");
          const rowObj = {};
          headers.forEach((h, i) => {
            rowObj[h.trim()] = cols[i]?.trim();
          });
          return rowObj;
        });
        convertedData = builder.buildObject({ root: arr });
      }
      // 4) YAML → XML
      else if (file.mimetype === "application/x-yaml") {
        const yamlData = yaml.load(content);
        convertedData = builder.buildObject(yamlData);
      }

      // 5) 최종 .xml 확장자로 파일명 생성
      const { finalNameWithoutUUID, outputFileName } = getFinalFileName(
        file.originalname,
        ".xml"
      );
      console.log("✅ 최종 저장 파일명:", outputFileName);

      // 6) 변환된 XML 저장
      fs.writeFileSync(path.join(convertedPath, outputFileName), convertedData);

      // 7) 응답 데이터
      convertedFiles.push(`/download/${outputFileName}`);
      fileNames.push(finalNameWithoutUUID);
    }

    return res.json({
      message: "파일 → XML 변환 성공!",
      downloadUrls: convertedFiles,
      fileNames,
    });
  } catch (error) {
    console.error("❌ XML 변환 중 오류 발생:", error);
    return res
      .status(500)
      .json({ message: "XML 변환 중 오류 발생", error: error.message });
  }
});

module.exports = router;
