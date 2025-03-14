const multer = require("multer");
const path = require("path");

// ✅ 한글 파일명 깨짐 방지 (latin1 제거)
const normalizeFileName = (fileName) => {
  try {
    return fileName.normalize("NFC"); // macOS에서 깨지는 한글 정규화
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
    const normalizedFileName = normalizeFileName(file.originalname);
    cb(null, normalizedFileName); // ✅ Date.now() 없이 원본 파일명 유지
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
