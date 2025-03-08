const express = require("express");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const { upload } = require("../middlewares/multerConfig"); // 업로드 미들웨어

const router = express.Router();

router.post("/", upload.array("files"), async (req, res) => {
  console.log("📂 ZIP 변환 요청 수신됨"); // 요청이 정상적으로 도착했는지 확인

  if (!req.files || req.files.length === 0) {
    console.error("❌ 파일이 업로드되지 않았습니다.");
    return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
  }

  try {
    const timestamp = Date.now();
    const outputFileName = `${timestamp}.zip`;
    const outputFilePath = `uploads/converted/${outputFileName}`;

    console.log("📌 변환 파일명:", outputFileName);

    const output = fs.createWriteStream(outputFilePath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.on("error", (err) => {
      console.error("❌ ZIP 압축 중 오류 발생:", err);
      res
        .status(500)
        .json({ message: "파일 압축 중 오류 발생", error: err.message });
    });

    archive.pipe(output);

    req.files.forEach((file) => {
      console.log(`📂 파일 추가 중: ${file.originalname}`);
      archive.append(fs.createReadStream(file.path), {
        name: file.originalname,
      });
    });

    await archive.finalize();

    output.on("close", () => {
      console.log("✅ ZIP 파일 생성 완료:", outputFilePath);
      res.json({
        message: "파일 압축 성공!",
        downloadUrl: `/download/${outputFileName}`,
      });
    });
  } catch (error) {
    console.error("❌ ZIP 변환 중 예외 발생:", error);
    res
      .status(500)
      .json({ message: "파일 변환 중 오류 발생", error: error.message });
  }
});

module.exports = router;
