const multer = require("multer");
const path = require("path");
const fs = require("fs");

// ✅ 파일명에서 특수문자 제거 함수
const sanitizeFileName = (fileName) => {
  try {
    return fileName.replace(/[^a-zA-Z0-9가-힣-_ ]/g, "") || "converted"; // 파일명이 비면 기본값
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
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const isKorean = /[가-힣]/.test(file.originalname); // ✅ 한글 포함 여부 확인
    const baseName = isKorean
      ? "converted"
      : sanitizeFileName(path.parse(file.originalname).name); // ✅ 한글이면 'converted'
    const extension = path.extname(file.originalname); // ✅ 원본 확장자 유지
    cb(null, `${baseName}${extension}`); // ✅ 원본 확장자 유지하면서 파일 저장
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // ✅ 개별 파일 크기 200MB 제한
  fileFilter: (req, file, cb) => {
    console.log("✅ fileFilter 실행됨!");
    console.log("✅ 업로드 시도 파일 타입:", file.mimetype);
    if (!file.mimetype) {
      console.error("❌ 파일이 거부됨:", file.originalname);
      return cb(new Error("유효하지 않은 파일 형식입니다."), false);
    }
    cb(null, true);
  },
});

module.exports = { upload };
