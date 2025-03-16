// utils/convertFileName.js
const path = require("path");
const { randomUUID } = require("crypto");

function getFinalFileName(originalName, targetExtension = ".png") {
  // 1) 파일명 정리
  let decodedFileName = decodeURIComponent(originalName);
  let sanitizedFileName = decodedFileName
    .normalize("NFC")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9가-힣._-]/g, "");

  // 2) 기존 확장자 제거 → 최종 확장자만 붙임
  sanitizedFileName = sanitizedFileName.replace(
    new RegExp(`${path.extname(sanitizedFileName)}$`),
    ""
  );

  // 3) 최종 다운 시 보여줄 파일명
  const finalNameWithoutUUID = sanitizedFileName + targetExtension;

  // 4) 서버 저장용: UUID + 정리된 이름
  const outputFileName = `${randomUUID()}_${finalNameWithoutUUID}`;

  return {
    finalNameWithoutUUID, // "사진.png" 처럼 최종 확장자 붙은 이름
    outputFileName, // "578f9b6d-8453_사진.png"
  };
}

module.exports = { getFinalFileName };
