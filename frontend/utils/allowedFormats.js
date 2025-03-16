const allowedFormats = {
  "to-avi": ["video/mp4", "video/webm", "video/mov", "video/mkv", "image/gif"],
  "to-bmp": [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/tiff",
    "image/webp",
  ],
  "to-csv": ["application/json", "application/xml", "application/x-yaml"],
  "to-docx": [
    "text/plain",
    "application/pdf",
    "text/markdown",
    "text/html",
    "text/csv",
    "application/rtf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  "to-excel": ["text/plain", "text/csv", "application/pdf"],
  "to-gif": [
    "image/jpeg",
    "image/png",
    "image/bmp",
    "image/tiff",
    "image/webp",
    "image/svg+xml",
    "image/apng",
    "image/heic",
    "image/avif",
  ],
  "to-heic": [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/tiff",
    "image/webp",
    "image/avif",
    "image/svg+xml",
  ],
  "to-html": ["text/plain", "text/csv", "application/pdf"],
  "to-hwp": ["text/plain", "text/csv", "application/pdf"],
  "to-jpeg": [
    "image/png",
    "image/jpeg",
    "image/svg+xml",
    "image/gif",
    "image/bmp",
    "image/tiff",
    "image/webp",
    "image/heic",
    "image/avif",
    "image/vnd.adobe.photoshop",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  "to-json": ["text/csv", "application/xml", "application/x-yaml"],
  "to-mkv": ["video/mp4", "video/webm", "video/avi", "video/mov", "image/gif"],
  "to-mov": ["video/mp4", "video/webm", "video/avi", "video/mkv", "image/gif"],
  "to-mp3": [
    "audio/wav",
    "audio/flac",
    "audio/aac",
    "audio/ogg",
    "audio/m4a",
    "audio/opus",
  ],
  "to-mp4": ["video/webm", "video/avi", "video/mov", "video/mkv", "image/gif"],
  "to-pdf": [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "text/plain",
    "application/x-hwp",
    "image/png",
    "image/jpeg",
    "image/gif",
    "image/bmp",
    "image/tiff",
    "image/webp",
    "image/svg+xml",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/markdown",
    "text/html",
    "text/csv",
    "application/rtf",
    "application/epub+zip",
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
    "image/heic",
    "image/avif",
    "image/vnd.adobe.photoshop",
  ],
  "to-ppt": [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/tiff",
    "image/webp",
    "application/pdf",
    "text/plain",
  ],
  "to-svg": [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/tiff",
    "image/webp",
    "image/heic",
    "image/avif",
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
    "image/heic",
    "image/avif",
    "image/vnd.adobe.photoshop",
  ],
  "to-txt": [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/pdf",
    "application/x-hwp",
    "application/rtf",
    "text/csv",
    "application/epub+zip",
  ],
  "to-wav": [
    "audio/mp3",
    "audio/flac",
    "audio/aac",
    "audio/ogg",
    "audio/m4a",
    "audio/opus",
  ],
  "to-webp": [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/bmp",
    "image/tiff",
    "image/webp",
    "image/heic",
    "image/avif",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  "to-xml": ["application/json", "text/csv", "application/x-yaml"],
  "to-zip": "*", // 모든 파일 허용
};

export default allowedFormats;
