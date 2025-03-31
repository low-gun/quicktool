// backend/routes/video/videoTrim.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const ffmpeg = require("fluent-ffmpeg");

const upload = multer({ dest: "uploads/original" });
const convertedPath = path.join(__dirname, "../../uploads/converted");

router.post("/", upload.single("files"), async (req, res) => {
  try {
    // startTime(초), duration(초)등
    const { startTime, duration } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "No video file uploaded" });
    }
    if (!startTime || !duration) {
      return res.status(400).json({ error: "startTime and duration required" });
    }

    const inputPath = req.file.path;
    const ext = path.extname(req.file.originalname) || ".mp4";
    const outputFilename = `${uuidv4()}_${req.file.originalname.replace(
      /[^a-zA-Z0-9가-힣-_]/g,
      ""
    )}${ext}`;
    const outputPath = path.join(convertedPath, outputFilename);

    await new Promise((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(startTime) // 시작 지점(초)
        .setDuration(duration) // trim할 길이(초)
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
