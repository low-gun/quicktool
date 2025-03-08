// utils/allowedFormats.js

const allowedFormats = {
  "to-bmp": [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/tiff",
    "image/webp",
  ],
  "do-docx": ["text/plain", "application/pdf"],
  "to-gif": [
    "image/jpeg",
    "image/png",
    "image/bmp",
    "image/tiff",
    "image/webp",
  ],
  "to-heic": [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/tiff",
  ],
  "to-jpeg": [
    "image/png",
    "image/svg+xml",
    "image/gif",
    "image/bmp",
    "image/tiff",
    "image/webp",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  "to-pdf": [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/x-hwp",
  ],
  "to-png": [
    "image/jpeg",
    "image/svg+xml",
    "image/gif",
    "image/bmp",
    "image/tiff",
    "image/webp",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  "to-svg": [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/tiff",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  "to-tiff": [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/webp",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  "to-txt": [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/pdf",
    "application/x-hwp",
  ],
  "to-webp": [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/tiff",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  "to-zip": "*", // 모든 파일 허용
};

export default allowedFormats;
