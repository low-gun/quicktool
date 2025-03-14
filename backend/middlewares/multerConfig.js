const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ 한글 깨짐 방지 및 특수문자 제거
const sanitizeFileName = (fileName) => {
  try {
    return fileName.normalize("NFC").replace(/[^a-zA-Z0-9가-힣-_ ]/g, ""); // ✅ 특수문자 제거
  } catch (error) {
    console.error("파일명 정규화 오류:", error);
    return "converted"; // 오류 발생 시 기본 파일명
  }
};

// ✅ 업로드 폴더 생성 (폴더 없으면 자동 생성)
const uploadPath = path.join(__dirname, "../uploads/original/");
if (!fs.existsSync(uploadPath)) {
  console.log("📂 업로드 폴더 생성:", uploadPath);
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/original/"));
  },
  filename: (req, file, cb) => {
    const originalName = path.parse(file.originalname).name; // 원본 파일명 유지
    const sanitizedFileName = originalName.replace(/[^a-zA-Z0-9가-힣-_ ]/g, ""); // 특수문자 제거
    const finalFileName = `${Date.now()}-${sanitizedFileName}.jpeg`; // 확장자 무조건 .jpeg로
    cb(null, finalFileName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB 제한
  fileFilter: (req, file, cb) => {
    if (!file.mimetype) {
      return cb(new Error("유효하지 않은 파일 형식입니다."), false);
    }
    cb(null, true);
  },
});

module.exports = { upload };
