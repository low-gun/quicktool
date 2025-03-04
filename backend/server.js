const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const pool = require("./config/db");
const apiRoutes = require("./routes/api"); // API 라우트 불러오기
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(
  cors({
    origin: "http://localhost:3000", // 프론트엔드 주소 허용
    credentials: true, // 쿠키 및 인증 정보 포함 허용
    methods: ["GET", "POST", "PUT", "DELETE"], // 허용할 HTTP 메서드
  })
);
app.use(express.json());
app.use("/api", apiRoutes); // 모든 API 요청을 /api 경로에서 처리
pool
  .getConnection()
  .then((conn) => {
    console.log("✅ MySQL 데이터베이스 연결 성공");
    conn.release();
  })
  .catch((err) => {
    console.error("❌ MySQL 연결 오류:", err);
  });

// 기본 라우트
app.get("/", (req, res) => {
  res.send("Express 서버가 실행 중입니다.");
});

// 서버 실행
app.listen(PORT, () => {
  console.log(`🚀 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});
