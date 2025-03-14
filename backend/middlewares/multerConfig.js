const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ 한글 깨짐 방지 및 특수문자 제거
const sanitizeFileName = (fileName) => {
  try {
    // ✅ multer에서 한글이 깨지는 문제 해결 (latin1 → utf8 변환)
    const decodedName = Buffer.from(fileName, "latin1").toString("utf8");
    return decodedName.normalize("NFC").replace(/[^a-zA-Z0-9가-힣-_ ]/g, "");
  } catch (error) {
    console.error("파일명 정규화 오류:", error);
    return "converted";
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
    const sanitizedFileName = sanitizeFileName(file.originalname); // ✅ 한글 변환 후 파일명 정리
    cb(null, `${sanitizedFileName}.jpeg`);
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
