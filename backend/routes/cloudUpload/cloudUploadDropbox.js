// backend/routes/cloudUpload/cloudUploadDropbox.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const dropboxV2Api = require("dropbox-v2-api");

const upload = multer({ dest: "uploads/original" });

// token 설정 (env에서 가져오기)
const dropbox = dropboxV2Api.authenticate({
  token: process.env.DROPBOX_ACCESS_TOKEN || "YOUR_DROPBOX_TOKEN",
});

router.post("/", upload.single("files"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    // 업로드할 경로
    const dropboxPath = `/${uuidv4()}_${req.file.originalname}`;

    // 1) 먼저 파일 업로드
    await new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path).pipe(
        dropbox(
          {
            resource: "files/upload",
            parameters: {
              path: dropboxPath,
              mode: "add",
              autorename: true,
              mute: false,
            },
          },
          (err, result) => {
            if (err) reject(err);
            else resolve(result);
          }
        )
      );
    });

    // 2) 업로드 성공 후, 공유 링크 생성
    // 이미 공유 링크가 있다면 실패할 수도 있으므로, 예외 처리 필요할 수 있음
    const sharedLink = await new Promise((resolve, reject) => {
      dropbox(
        {
          resource: "sharing/create_shared_link_with_settings",
          parameters: { path: dropboxPath },
        },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      );
    });

    // 공유 링크 URL (예: sharedLink.url)
    // dropbox는 끝에 ?dl=0 붙으면 미리보기, ?dl=1은 다운로드
    return res.json({
      message: "File uploaded to Dropbox and link created.",
      shareLink: sharedLink.url,
    });
  } catch (error) {
    console.error("Dropbox upload+share error:", error);
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
