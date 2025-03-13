require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const https = require("https"); // 🔹 HTTPS 모듈 추가
const { cleanupOldFiles } = require("./utils/cleanupFiles"); // 자동 삭제 기능 추가

const app = express();
const config = require("./config/default");

const PORT = config.port;

// 변환된 파일 저장 폴더 자동 생성 (없으면 생성)
const convertedFolder = path.resolve(__dirname, "uploads/converted/");
if (!fs.existsSync(convertedFolder)) {
  console.log(`📂 변환 폴더가 존재하지 않아 생성합니다: ${convertedFolder}`);
  fs.mkdirSync(convertedFolder, { recursive: true });
} else {
  console.log(`✅ 변환 폴더 확인됨: ${convertedFolder}`);
}

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

// ✅ 기본 API 라우트 추가
const apiRoutes = require("./routes/api");
app.use("/api", apiRoutes);

// ✅ 회원 API 라우트 추가
const userRoutes = require("./routes/users");
app.use("/api/users", userRoutes);

// ✅ 관리자 API 라우트 추가
const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);

// 변환된 파일 다운로드 경로 추가
app.get("/download/:filename", (req, res) => {
  const filePath = path.join(convertedFolder, req.params.filename);
  res.download(filePath, (err) => {
    if (err) {
      res.status(500).json({ message: "파일 다운로드 중 오류 발생" });
    }
  });
});

// 서버 시작 시 즉시 실행
cleanupOldFiles();

// 10분마다 실행 (배포 환경에서도 지속적으로 파일 삭제)
setInterval(cleanupOldFiles, 10 * 60 * 1000);

// 🔹 HTTPS 적용 (배포 환경에서만 실행)
if (process.env.NODE_ENV === "production") {
  const options = {
    key: fs.readFileSync("/etc/letsencrypt/live/quicktool.co.kr/privkey.pem"),
    cert: fs.readFileSync(
      "/etc/letsencrypt/live/quicktool.co.kr/fullchain.pem"
    ),
  };

  https.createServer(options, app).listen(5001, () => {
    console.log("✅ Secure Server is running on https://localhost:5001");
  });
} else {
  app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
  });
}
