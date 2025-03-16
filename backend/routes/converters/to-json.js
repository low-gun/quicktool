const express = require("express");
const fs = require("fs");
const path = require("path");
const { parseString } = require("xml2js");
const yaml = require("js-yaml");
const { upload } = require("../../middlewares/multerConfig");
const { getFinalFileName } = require("../../utils/convertFileName"); // ⬅️ 공통 함수 임포트

const router = express.Router();

// ✅ 지원하는 파일 형식 (JSON 변환 가능)
const allowedFormats = ["text/csv", "application/xml", "application/x-yaml"];

router.post("/", upload.array("files"), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
  }

  try {
    const convertedFiles = [];
    const fileNames = []; // 프론트로 내려줄 파일명
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

      // 2) XML → JSON
      if (file.mimetype === "application/xml") {
        await new Promise((resolve, reject) => {
          parseString(content, (err, result) => {
            if (err) return reject(err);
            convertedData = JSON.stringify(result, null, 2);
            resolve();
          });
        });
      }
      // 3) YAML → JSON
      else if (file.mimetype === "application/x-yaml") {
        const obj = yaml.load(content);
        convertedData = JSON.stringify(obj, null, 2);
      }
      // 4) CSV → JSON (텍스트로 읽고 단순 변환)
      else if (file.mimetype === "text/csv") {
        // CSV를 JSON으로 간단히 바꾸는 예시:
        // 각 줄을 ',' 스플릿해 객체 배열로 만들기 등
        const lines = content.split("\n");
        const headers = lines[0].split(",");
        const jsonArray = lines.slice(1).map((line) => {
          const cols = line.split(",");
          const rowObj = {};
          headers.forEach((h, i) => {
            rowObj[h.trim()] = cols[i]?.trim();
          });
          return rowObj;
        });
        convertedData = JSON.stringify(jsonArray, null, 2);
      }

      // 5) 최종 .json 확장자로 파일명 생성
      const { finalNameWithoutUUID, outputFileName } = getFinalFileName(
        file.originalname,
        ".json"
      );
      console.log("✅ 최종 저장 파일명:", outputFileName);

      // 6) 변환 결과 저장
      fs.writeFileSync(path.join(convertedPath, outputFileName), convertedData);

      // 7) 응답 데이터
      convertedFiles.push(`/download/${outputFileName}`);
      fileNames.push(finalNameWithoutUUID);
    }

    return res.json({
      message: "파일 → JSON 변환 성공!",
      downloadUrls: convertedFiles,
      fileNames,
    });
  } catch (error) {
    console.error("❌ JSON 변환 중 오류 발생:", error);
    return res
      .status(500)
      .json({ message: "JSON 변환 중 오류 발생", error: error.message });
  }
});

module.exports = router;
