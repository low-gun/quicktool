const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ 폴더가 존재하는지 확인하고 없으면 생성
const uploadPath = "backend/uploads/original/";
if (!fs.existsSync(uploadPath)) {
  console.log("📂 업로드 폴더가 없어 생성합니다:", uploadPath);
  fs.mkdirSync(uploadPath, { recursive: true });
}

// ✅ multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("📂 multer 파일 저장 경로:", uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    console.log("📂 multer 저장할 파일명:", file.originalname);
    cb(null, file.originalname.normalize("NFC")); // 한글 깨짐 방지
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype) {
      console.error("❌ 유효하지 않은 파일 형식:", file.mimetype);
      return cb(new Error("유효하지 않은 파일 형식입니다."), false);
    }
    console.log("✅ multer 파일 형식 통과:", file.mimetype);
    cb(null, true);
  },
});

module.exports = { upload };
