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
    console.log("📂 업로드 경로:", "backend/uploads/original/");
    cb(null, "backend/uploads/original/");
  },
  filename: (req, file, cb) => {
    console.log("📂 업로드 파일명 (원본):", file.originalname);
    const normalizedFileName = normalizeFileName(file.originalname);
    console.log("📂 정규화된 파일명:", normalizedFileName);
    cb(null, normalizedFileName); // ✅ 파일명을 원래 형태로 유지
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
    console.log("✅ 파일 형식 통과:", file.mimetype);
    cb(null, true);
  },
});

module.exports = { upload };
