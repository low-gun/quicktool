const multer = require("multer");
const path = require("path");

// 한글 깨짐 방지를 위한 파일명 처리 함수
const processFileName = (originalName) => {
  try {
    let decodedName = Buffer.from(originalName, "latin1").toString("utf-8"); // Latin-1 → UTF-8 변환
    decodedName = decodeURIComponent(decodedName); // URL 인코딩된 경우 복원
    return decodedName.replace(/[<>:"/\\|?*]+/g, ""); // 특수문자 제거
  } catch (error) {
    console.error("파일명 변환 오류:", error);
    return "converted"; // 변환 실패 시 기본 이름 할당
  }
};

// 파일 저장 위치 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "backend/uploads/original/");
  },
  filename: (req, file, cb) => {
    const processedFileName = processFileName(file.originalname);
    cb(null, `${Date.now()}-${processedFileName}`);
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
