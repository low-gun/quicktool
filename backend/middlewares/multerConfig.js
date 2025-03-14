router.post("/", upload.array("files"), async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ message: "파일이 업로드되지 않았습니다." });
  }

  try {
    const convertedFiles = [];

    for (const file of req.files) {
      console.log("📂 업로드된 원본 파일명:", file.originalname);

      let sanitizedName;
      try {
        // ✅ UTF-8 정규화 (NFD → NFC)
        sanitizedName = file.originalname.normalize("NFC");
      } catch (err) {
        console.error("❌ 파일명 정규화 실패:", err);
        sanitizedName = "converted"; // 변환 실패 시 기본값
      }

      console.log("📝 정규화된 파일명:", sanitizedName);
      const outputFileName = `${sanitizedName}.jpeg`;
      const outputFilePath = `backend/uploads/converted/${outputFileName}`;

      await sharp(file.path)
        .jpeg({ quality: 80, mozjpeg: true })
        .toFile(outputFilePath);
      console.log("✅ 파일 변환 완료:", outputFilePath);

      convertedFiles.push(`/download/${outputFileName}`);
    }

    res.json({
      message: "파일 → JPEG 변환 성공!",
      downloadUrls: convertedFiles,
    });
  } catch (error) {
    console.error("❌ 파일 변환 중 오류 발생:", error);
    res
      .status(500)
      .json({ message: "파일 변환 중 오류 발생", error: error.message });
  }
});
