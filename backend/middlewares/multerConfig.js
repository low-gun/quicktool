const multer = require("multer");
const path = require("path");

// 파일명 정규화 (한글 깨짐 방지)
const normalizeFileName = (fileName) => {
  try {
    return Buffer.from(fileName, "latin1").toString("utf-8").normalize("NFC");
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
  limits: { fileSize: 500 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype) {
      return cb(new Error("유효하지 않은 파일 형식입니다."), false);
    }
    cb(null, true);
  },
});

module.exports = { upload };
