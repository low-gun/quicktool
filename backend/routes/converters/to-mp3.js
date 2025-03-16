const express = require("express");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const { upload } = require("../../middlewares/multerConfig");
const { getFinalFileName } = require("../../utils/convertFileName"); // ⬅️ 공통 함수 임포트

const router = express.Router();

// ✅ 지원하는 파일 형식 (MP3 변환 가능)
const allowedFormats = [
  "audio/wav",
  "audio/flac",
  "audio/aac",
  "audio/ogg",
  "audio/m4a",
  "audio/opus",
];

router.post("/", upload.array("files"), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
  }

  try {
    const convertedFiles = [];
    const fileNames = []; // 프론트에 내려줄 파일명
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

      // 1) 최종 파일명: .mp3
      const { finalNameWithoutUUID, outputFileName } = getFinalFileName(
        file.originalname,
        ".mp3"
      );
      console.log("✅ 최종 저장 파일명:", outputFileName);

      const outputFilePath = path.join(convertedPath, outputFileName);

      // 2) ffmpeg 변환 -> MP3
      await new Promise((resolve, reject) => {
        ffmpeg(file.path)
          .toFormat("mp3")
          .on("end", () => resolve())
          .on("error", (error) => reject(error))
          .save(outputFilePath);
      });

      // 3) 응답용 데이터
      convertedFiles.push(`/download/${outputFileName}`);
      fileNames.push(finalNameWithoutUUID);
    }

    return res.json({
      message: "오디오 → MP3 변환 성공!",
      downloadUrls: convertedFiles,
      fileNames,
    });
  } catch (error) {
    console.error("❌ MP3 변환 중 오류 발생:", error);
    return res
      .status(500)
      .json({ message: "오디오 변환 중 오류 발생", error: error.message });
  }
});

module.exports = router;
