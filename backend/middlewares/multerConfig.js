const multer = require("multer");
const path = require("path");

// 한글 유니코드 정규화 (NFD → NFC)
const normalizeFileName = (fileName) => {
  try {
    return fileName.normalize("NFC"); // macOS에서 깨지는 한글을 정규화
  } catch (error) {
    console.error("파일명 정규화 오류:", error);
    return "converted"; // 오류 발생 시 기본 파일명
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "backend/uploads/original/");
  },
  filename: (req, file, cb) => {
    const normalizedFileName = normalizeFileName(file.originalname);
    cb(null, `${Date.now()}-${normalizedFileName}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 최대 파일 크기: 500MB
  },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype) {
      return cb(new Error("유효하지 않은 파일 형식입니다."), false);
    }
    cb(null, true);
  },
});

module.exports = { upload };
