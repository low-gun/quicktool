const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid"); // ✅ UUID 추가
const heicConvert = require("heic-convert");
const PSD = require("psd");
const pdfPoppler = require("pdf-poppler");
const mammoth = require("mammoth");
const ffmpeg = require("fluent-ffmpeg"); // ✅ 오디오 & 비디오 변환 추가

// ✅ 변환 함수 (모든 변환 기능에서 사용)
const convertFile = async (file, format) => {
  const convertedPath = path.join(__dirname, "../uploads/converted/");

  // ✅ 변환된 파일명 (UUID 적용 & 확장자 변경)
  let sanitizedFileName = file.originalname.replace(/[^a-zA-Z0-9가-힣-_]/g, ""); // 특수문자 제거
  const outputFileName = `${uuidv4()}_${sanitizedFileName}.${format}`;
  const outputFilePath = path.join(convertedPath, outputFileName);

  // 원본 파일 존재 여부 확인
  if (!fs.existsSync(file.path)) {
    throw new Error(`파일이 존재하지 않습니다: ${file.path}`);
  }

  // ✅ 이미지 변환 처리
  if (["jpeg", "png", "webp", "gif", "tiff", "bmp"].includes(format)) {
    await sharp(file.path).toFormat(format).toFile(outputFilePath);
  }
  // ✅ HEIC 변환 처리
  else if (file.mimetype === "image/heic") {
    const inputBuffer = fs.readFileSync(file.path);
    const outputBuffer = await heicConvert({
      buffer: inputBuffer,
      format: format.toUpperCase(),
    });
    fs.writeFileSync(outputFilePath, outputBuffer);
  }
  // ✅ PSD 변환 처리
  else if (file.mimetype === "image/vnd.adobe.photoshop") {
    const psd = await PSD.fromFile(file.path);
    const pngBuffer = await psd.image.toPng();
    await sharp(pngBuffer).toFormat(format).toFile(outputFilePath);
  }
  // ✅ PDF 변환 처리
  else if (file.mimetype === "application/pdf") {
    const options = {
      format: format,
      out_dir: convertedPath,
      out_prefix: path.parse(file.filename).name,
    };
    await pdfPoppler.convert(file.path, options);
  }
  // ✅ DOCX 변환 처리
  else if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const docText = await mammoth.extractRawText({ path: file.path });
    const buffer = Buffer.from(docText.value, "utf-8");
    await sharp(buffer).toFormat(format).toFile(outputFilePath);
  }
  // ✅ 오디오 변환 처리 (MP3, WAV)
  else if (["mp3", "wav"].includes(format)) {
    await new Promise((resolve, reject) => {
      ffmpeg(file.path)
        .toFormat(format)
        .on("end", resolve)
        .on("error", reject)
        .save(outputFilePath);
    });
  }
  // ✅ 비디오 변환 처리 (MP4, WebM, AVI)
  else if (["mp4", "webm", "avi"].includes(format)) {
    await new Promise((resolve, reject) => {
      ffmpeg(file.path)
        .output(outputFilePath)
        .on("end", resolve)
        .on("error", reject)
        .run();
    });
  }
  // ✅ 지원되지 않는 파일 형식
  else {
    throw new Error(`지원되지 않는 변환 형식: ${format}`);
  }

  return { outputFilePath, outputFileName };
};

module.exports = { convertFile };
