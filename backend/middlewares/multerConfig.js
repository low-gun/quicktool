const multer = require("multer");
const path = require("path");

// 파일 저장 위치 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/original/");
  },
  filename: (req, file, cb) => {
    // ✅ 파일명을 UTF-8로 변환하여 저장
    const utf8FileName = Buffer.from(file.originalname, "binary").toString(
      "utf-8"
    );

    // ✅ 특수문자 제거 (파일명 문제 방지)
    const sanitizedFileName = utf8FileName.replace(/[<>:"/\\|?*]+/g, "");

    cb(null, Date.now() + "-" + sanitizedFileName);
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
