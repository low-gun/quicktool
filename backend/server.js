require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { cleanupOldFiles } = require("./utils/cleanupFiles"); // 자동 삭제 기능 추가

const app = express();
const config = require("./config/default");

const PORT = config.port;

app.use(
  cors({
    origin: "*", // 모든 도메인 허용
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);
app.use(express.json());

const apiRoutes = require("./routes/api");

app.use("/api", apiRoutes);

// 변환된 파일 다운로드 경로 추가
app.get("/download/:filename", (req, res) => {
  const filePath = path.join(
    __dirname,
    "uploads/converted",
    req.params.filename
  );
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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
