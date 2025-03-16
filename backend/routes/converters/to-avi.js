const express = require("express");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const { upload } = require("../../middlewares/multerConfig");
const { getFinalFileName } = require("../../utils/convertFileName"); // ⬅️ 공통 함수 임포트

const router = express.Router();

// ✅ 지원하는 파일 형식 (AVI 변환 가능)
const allowedFormats = [
  "video/mp4",
  "video/webm",
  "video/mov",
  "video/mkv",
  "image/gif",
];

router.post("/", upload.array("files"), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
  }

  try {
    const convertedFiles = [];
    const fileNames = []; // ⬅️ 프론트로 내려줄 파일명 목록
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

      // 1) .avi 확장자를 목표로 파일명 생성 (UUID 포함)
      const { finalNameWithoutUUID, outputFileName } = getFinalFileName(
        file.originalname,
        ".avi"
      );
      console.log("✅ 최종 저장 파일명:", outputFileName);

      const outputFilePath = path.join(convertedPath, outputFileName);

      // 2) ffmpeg 변환 실행
      await new Promise((resolve, reject) => {
        ffmpeg(file.path)
          .output(outputFilePath)
          .on("end", () => resolve())
          .on("error", (error) => reject(error))
          .run();
      });

      // 3) 응답용 데이터
      convertedFiles.push(`/download/${outputFileName}`);
      fileNames.push(finalNameWithoutUUID);
    }

    return res.json({
      message: "비디오 → AVI 변환 성공!",
      downloadUrls: convertedFiles,
      fileNames,
    });
  } catch (error) {
    console.error("❌ 비디오 변환 중 오류 발생:", error);
    return res
      .status(500)
      .json({ message: "비디오 변환 중 오류 발생", error: error.message });
  }
});

module.exports = router;
