const mimeToExtension = {
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "image/gif": "GIF",
  "image/bmp": "BMP",
  "image/tiff": "TIFF",
  "image/webp": "WEBP",
  "image/svg+xml": "SVG",
  "application/pdf": "PDF",
  "text/plain": "TXT",
  "text/csv": "CSV",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "Word(DOCX)",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
    "Excel(XLSX)",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "PowerPoint(PPTX)",
  "image/vnd.adobe.photoshop": "PSD",

  // 필요 추가
  "application/x-hwp": "HWP",
  "application/vnd.ms-excel": "Excel(XLS)",
  "application/vnd.ms-powerpoint": "PowerPoint(PPT)",
  "text/markdown": "Markdown",
  "text/html": "HTML",
  "application/rtf": "RTF",
  "application/epub+zip": "EPUB",
};

export function formatAllowedExtensions(allowedFormats) {
  const formattedExtensions = [
    ...new Set(
      allowedFormats.map(
        (mime) => mimeToExtension[mime] || mime.split("/").pop().toUpperCase()
      )
    ),
  ];

  return formattedExtensions.join(", ");
}
