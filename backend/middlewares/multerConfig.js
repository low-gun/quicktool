const multer = require("multer");
const path = require("path");

// ✅ 한글 깨짐 방지 + 특수문자 제거
const sanitizeFileName = (fileName) => {
  try {
    return fileName.normalize("NFC").replace(/[^a-zA-Z0-9가-힣-_ ]/g, ""); // 특수문자 제거
  } catch (error) {
    console.error("파일명 정규화 오류:", error);
    return "converted"; // 오류 발생 시 기본 파일명
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/original/")); // ✅ 절대경로 사용
  },
  filename: (req, file, cb) => {
    const sanitizedFileName = sanitizeFileName(file.originalname);
    const finalFileName = `${Date.now()}-${sanitizedFileName}`; // ✅ 유니크한 파일명 보장
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
