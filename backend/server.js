require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const { cleanupOldFiles } = require("./utils/cleanupFiles"); // 자동 삭제 기능 추가

const app = express();

// ✅ 포트 설정 (환경변수 또는 기본값 5001)
const PORT = process.env.PORT || 5001;

// ✅ 변환된 파일 저장 폴더 자동 생성 (없으면 생성)
const convertedFolder = path.resolve(__dirname, "uploads/converted/");
if (!fs.existsSync(convertedFolder)) {
  console.log(`📂 변환 폴더가 존재하지 않아 생성합니다: ${convertedFolder}`);
  fs.mkdirSync(convertedFolder, { recursive: true });
} else {
  console.log(`✅ 변환 폴더 확인됨: ${convertedFolder}`);
}

// ✅ CORS 설정
app.use(
  cors({
    origin: "https://www.quicktool.co.kr",
    credentials: true, // 쿠키 등 전송 허용
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ API 라우트 추가
const apiRoutes = require("./routes/api");
app.use("/api", apiRoutes);

// (신규) 사용자, 관리자 라우트 등록
const userRoutes = require("./routes/users");
const adminRoutes = require("./routes/admin");
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

// ✅ 변환된 파일 다운로드 경로 추가
app.get("/download/:filename", (req, res) => {
  const originalFilename = req.params.filename;
  const filePath = path.join(convertedFolder, originalFilename);

  // 한글 파일명 처리
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="dummy"; filename*=UTF-8''${encodeURIComponent(
      originalFilename
    )}`
  );
  res.setHeader("Content-Type", "application/octet-stream");

  // 실제 파일 다운로드
  res.download(filePath, originalFilename, (err) => {
    if (err) {
      console.error("파일 다운로드 중 오류:", err);
      res.status(500).json({ message: "파일 다운로드 중 오류 발생" });
    }
  });
});

// ✅ 서버 시작 시 즉시 실행 (오래된 파일 정리)
cleanupOldFiles();

// ✅ 10분마다 파일 정리 실행 (배포 환경 유지)
setInterval(cleanupOldFiles, 10 * 60 * 1000);

// ✅ 서버 실행 (HTTP 사용)
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
