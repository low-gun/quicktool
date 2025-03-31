// backend/routes/video/videoSubtitle.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const ffmpeg = require("fluent-ffmpeg");

// 업로드 폴더 (원본)
const upload = multer({ dest: "uploads/original" });
const convertedPath = path.join(__dirname, "../../uploads/converted");

// 예: 클라이언트에서 "files" 배열에 [video, subtitle] 순서로 업로드
router.post("/", upload.array("files", 2), async (req, res) => {
  try {
    // 첫 번째: 영상, 두 번째: 자막(srt)
    const [videoFile, subtitleFile] = req.files || [];
    if (!videoFile || !subtitleFile) {
      return res
        .status(400)
        .json({ error: "Must upload a video file and a subtitle file" });
    }

    const videoPath = videoFile.path;
    const subtitlePath = subtitleFile.path;
    const ext = path.extname(videoFile.originalname) || ".mp4";

    const outputFilename = `${uuidv4()}_${videoFile.originalname.replace(
      /[^a-zA-Z0-9가-힣-_]/g,
      ""
    )}${ext}`;
    const outputPath = path.join(convertedPath, outputFilename);

    // ffmpeg로 하드섭(영상에 자막 삽입)
    // ※ 자막 폴더 경로/인코딩 문제에 따라 -vf subtitles= 쓰일 수도, 또는
    //   .srt를 ASS로 변환 후 사용하기도 합니다. 단순 예시로만 보여드립니다.
    await new Promise((resolve, reject) => {
      ffmpeg(videoPath)
        .videoFilters(`subtitles=${subtitlePath}`)
        .on("end", resolve)
        .on("error", reject)
        .save(outputPath);
    });

    const downloadUrl = `/download/${outputFilename}`;
    return res.json({ downloadUrl });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
