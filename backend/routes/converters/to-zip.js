const express = require("express");
const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const { randomUUID } = require("crypto");
const { upload } = require("../../middlewares/multerConfig");
const { getFinalFileName } = require("../../utils/convertFileName"); // ⬅️ 공통 함수 임포트

const router = express.Router();

router.post("/", upload.array("files"), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
  }
  console.log("✅ ZIP 변환 요청 수신!");

  try {
    const convertedPath = path.join(__dirname, "../../uploads/converted/");
    if (!fs.existsSync(convertedPath)) {
      fs.mkdirSync(convertedPath, { recursive: true });
    }

    let zipFileName;

    if (req.files.length === 1) {
      // 파일이 1개 → UUID + 원래 파일명
      const { finalNameWithoutUUID, outputFileName } = getFinalFileName(
        req.files[0].originalname,
        ".zip"
      );
      // 예: b5f60f2e-7b7f_myDoc.zip
      zipFileName = outputFileName;
    } else {
      // 파일이 여러 개 → "압축된_파일.zip"
      // 여기도 원한다면 getFinalFileName을 쓸 수 있음
      zipFileName = `${randomUUID()}_압축된_파일.zip`;
    }

    const zipFilePath = path.join(convertedPath, zipFileName);

    // ZIP 압축 생성
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => {
      console.log(`✅ ZIP 파일 생성 완료: ${zipFilePath}`);
      try {
        const responseData = {
          message: "파일 → ZIP 압축 성공!",
          downloadUrl: `/download/${zipFileName}?original=${encodeURIComponent(
            zipFileName
          )}`,
        };
        console.log("✅ 변환 성공 응답 데이터:", responseData);

        res.json(responseData);
        console.log("✅ 변환 성공 응답 전송 완료!");
      } catch (error) {
        console.error("❌ 응답 전송 중 오류 발생:", error);
      }
    });

    archive.on("error", (err) => {
      console.error("❌ ZIP 압축 중 오류:", err);
      return res
        .status(500)
        .json({ message: "ZIP 압축 중 오류 발생", error: err.message });
    });

    archive.pipe(output);

    for (const file of req.files) {
      console.log(`✅ 파일 추가 중: ${file.originalname}`);
      if (fs.existsSync(file.path)) {
        // zip 내부에는 originalname 그대로 넣어줌
        archive.append(fs.createReadStream(file.path), {
          name: file.originalname,
        });
      } else {
        console.error(`❌ 파일이 존재하지 않음: ${file.path}`);
        return res
          .status(400)
          .json({ message: `파일을 찾을 수 없습니다: ${file.originalname}` });
      }
    }

    await archive.finalize();
    console.log(`✅ ZIP 압축이 정상적으로 완료됨: ${zipFilePath}`);
  } catch (error) {
    console.error("❌ ZIP 변환 중 오류 발생:", error);
    res
      .status(500)
      .json({ message: "ZIP 변환 중 오류 발생", error: error.message });
  }
});

module.exports = router;
