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
const allowedOrigins = ["http://localhost:3000", "https://www.quicktool.co.kr"];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
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
  console.log("✅ 다운로드 요청 파일:", req.params.filename);
  const filename = req.params.filename;
  const filePath = path.join(convertedFolder, filename);

  console.log("✅ 파일 경로 확인:", filePath);
  if (!fs.existsSync(filePath)) {
    console.error("❌ 파일이 존재하지 않음:", filePath);
    return res.status(404).json({ message: "파일을 찾을 수 없습니다." });
  }

  // ✅ ZIP 파일 처리: 파일 개수에 따라 다르게 처리
  if (filename.endsWith(".zip")) {
    if (filename.includes("_")) {
      // ✅ 파일이 1개일 경우: UUID 제거 후 원래 파일명 유지
      const originalFilename = filename.replace(/^[a-f0-9-]+_/, "");
      console.log("✅ ZIP 다운로드 - 원래 파일명 유지:", originalFilename);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename*=UTF-8''${encodeURIComponent(originalFilename)}`
      );
      return res.download(filePath, originalFilename, (err) => {
        if (err) {
          console.error("❌ ZIP 파일 다운로드 중 오류:", err);
          return res
            .status(500)
            .json({ message: "ZIP 파일 다운로드 중 오류 발생" });
        }
      });
    } else {
      // ✅ 파일이 2개 이상일 경우: "압축된_파일.zip" 그대로 유지
      console.log("✅ ZIP 다운로드 - 기본 파일명 유지:", filename);
      res.setHeader(
        "Content-Disposition",
        `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`
      );
      return res.download(filePath, filename, (err) => {
        if (err) {
          console.error("❌ ZIP 파일 다운로드 중 오류:", err);
          return res
            .status(500)
            .json({ message: "ZIP 파일 다운로드 중 오류 발생" });
        }
      });
    }
  } else if (filename.endsWith(".pptx") || filename.endsWith(".xlsx")) {
    // ✅ PPTX, XLSX 변환된 파일도 UUID 제거
    const originalFilename = filename.replace(/^[a-f0-9-]+_/, "");
    console.log("✅ 문서 다운로드 - 원래 파일명 유지:", originalFilename);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodeURIComponent(originalFilename)}`
    );
    return res.download(filePath, originalFilename, (err) => {
      if (err) {
        console.error("❌ 문서 파일 다운로드 중 오류:", err);
        return res
          .status(500)
          .json({ message: "문서 파일 다운로드 중 오류 발생" });
      }
    });
  } else {
    // ✅ 일반 파일 처리 (JPEG, PNG, MP3 등): UUID 제거 후 원래 파일명 유지
    const originalFilename = filename.replace(/^[a-f0-9-]+_/, "");
    console.log("✅ 일반 파일 다운로드:", originalFilename);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodeURIComponent(originalFilename)}`
    );
    res.setHeader("Content-Type", "application/octet-stream");

    res.download(filePath, originalFilename, (err) => {
      if (err) {
        console.error("❌ 파일 다운로드 중 오류:", err);
        return res.status(500).json({ message: "파일 다운로드 중 오류 발생" });
      }
    });
  }
});

// ✅ 서버 시작 시 즉시 실행 (오래된 파일 정리)
cleanupOldFiles();

// ✅ 10분마다 파일 정리 실행 (배포 환경 유지)
setInterval(cleanupOldFiles, 10 * 60 * 1000);

// ✅ 서버 실행 (HTTP 사용)
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
