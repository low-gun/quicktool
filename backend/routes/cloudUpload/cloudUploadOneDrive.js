// backend/routes/cloudUpload/cloudUploadOneDrive.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");

const upload = multer({ dest: "uploads/original" });

// 토큰 발급 or refresh 로직이 필요함
// 여기서는 간단히 process.env.ONEDRIVE_ACCESS_TOKEN 으로 가정
const ONE_DRIVE_TOKEN = process.env.ONEDRIVE_ACCESS_TOKEN || "";

router.post("/", upload.single("files"), async (req, res) => {
  try {
    if (!ONE_DRIVE_TOKEN) {
      return res.status(500).json({ error: "OneDrive access token missing" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // 업로드할 파일명
    const newFileName = `${uuidv4()}_${req.file.originalname}`;
    const driveItemPath = `/drive/root:/${newFileName}:/content`;
    // "root:/{filename}:/content" → OneDrive Graph API Upload

    const fileBuffer = fs.readFileSync(req.file.path);

    // 마이크로소프트 Graph API를 통해 업로드
    const uploadUrl = `https://graph.microsoft.com/v1.0/me${driveItemPath}`;
    const response = await axios.put(uploadUrl, fileBuffer, {
      headers: {
        Authorization: `Bearer ${ONE_DRIVE_TOKEN}`,
        "Content-Type": req.file.mimetype,
      },
    });

    return res.json({
      message: "File uploaded to OneDrive successfully",
      oneDriveItem: response.data,
    });
  } catch (error) {
    console.error("OneDrive upload error:", error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
