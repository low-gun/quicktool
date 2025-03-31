// backend/routes/cloudUpload/cloudUploadGoogleDrive.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { google } = require("googleapis");
const { v4: uuidv4 } = require("uuid");

const upload = multer({ dest: "uploads/original" });

// 구글 서비스 계정 키 JSON 경로
const KEYFILEPATH =
  process.env.GOOGLE_SERVICE_ACCOUNT_JSON || "service-key.json";

// 스코프 설정
const SCOPES = ["https://www.googleapis.com/auth/drive.file"];

// drive 객체 생성 함수
function getDriveClient() {
  const auth = new google.auth.GoogleAuth({
    keyFile: KEYFILEPATH,
    scopes: SCOPES,
  });
  return google.drive({ version: "v3", auth });
}

// POST /api/cloud/google-drive
router.post("/", upload.single("files"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const drive = getDriveClient();
    const filePath = req.file.path;

    // 업로드할 파일 메타정보 설정
    const fileMetadata = {
      name: `${uuidv4()}_${req.file.originalname}`,
      // parents: ["<some-folder-id>"], // 특정 폴더에 업로드 시
    };

    const media = {
      mimeType: req.file.mimetype,
      body: fs.createReadStream(filePath),
    };

    // 구글 드라이브 업로드 실행
    const response = await drive.files.create({
      resource: fileMetadata,
      media: media,
      fields: "id, name, mimeType, webViewLink, webContentLink",
    });

    // 업로드 결과
    return res.json({
      message: "File uploaded to Google Drive",
      fileId: response.data.id,
      fileName: response.data.name,
      webViewLink: response.data.webViewLink,
    });
  } catch (error) {
    console.error("Google Drive upload error:", error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
