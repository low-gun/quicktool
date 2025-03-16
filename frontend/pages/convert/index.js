import { useRouter } from "next/router";
import Image from "next/image";

// 변환 가능한 파일 형식 목록 (현재 구현된 기능만 포함, image는 "" 처리)
const formats = [
  // 이미지 먼저
  { name: "JPEG", type: "to-jpeg", image: "" },
  { name: "PNG", type: "to-png", image: "" },
  { name: "GIF", type: "to-gif", image: "" },
  { name: "HEIC", type: "to-heic", image: "" },
  { name: "WEBP", type: "to-webp", image: "" },
  { name: "SVG", type: "to-svg", image: "" },
  { name: "TIFF", type: "to-tiff", image: "" },
  { name: "BMP", type: "to-bmp", image: "" },
  // 나머지 순서 그대로
  { name: "PDF", type: "to-pdf", image: "" },
  { name: "DOCX", type: "to-docx", image: "" },
  { name: "EXCEL", type: "to-excel", image: "" },
  { name: "PPT", type: "to-ppt", image: "" },
  { name: "MP4", type: "to-mp4", image: "" },
  { name: "MP3", type: "to-mp3", image: "" },
  { name: "WAV", type: "to-wav", image: "" },
  { name: "ZIP", type: "to-zip", image: "" },
  { name: "CSV", type: "to-csv", image: "" },
  { name: "JSON", type: "to-json", image: "" },
  { name: "XML", type: "to-xml", image: "" },
  { name: "YAML", type: "to-yaml", image: "" },
  { name: "WEBM", type: "to-webm", image: "" },
  { name: "MOV", type: "to-mov", image: "" },
  { name: "AVI", type: "to-avi", image: "" },
  { name: "MKV", type: "to-mkv", image: "" },
  { name: "TXT", type: "to-txt", image: "" },
];

export default function ConvertHome() {
  const router = useRouter();

  const handleConvertClick = (type) => {
    router.push(`/convert/${type}`);
  };

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "50px",
        background: "#f9f9f9",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
        maxWidth: "900px",
        margin: "auto",
      }}
    >
      <h1 style={{ fontSize: "30px", fontWeight: "bold", color: "#333" }}>
        🚧 준비중 🚧
      </h1>
      <p style={{ fontSize: "18px", color: "#666", marginBottom: "25px" }}>
        원하는 변환 형식을 선택하세요.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: "15px",
          justifyContent: "center",
          maxWidth: "700px",
          margin: "auto",
        }}
      >
        {formats.map((format) => (
          <button
            key={format.type}
            onClick={() => handleConvertClick(format.type)}
            style={{
              padding: "20px",
              fontSize: "14px",
              cursor: "pointer",
              border: "none",
              borderRadius: "10px",
              background: "#ffffff",
              textAlign: "center",
              boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.2s ease",
              color: "#000",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
            onMouseOver={(e) => (e.target.style.transform = "scale(1.07)")}
            onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
          >
            {format.image ? (
              <Image
                src={format.image}
                alt={format.name}
                width={40}
                height={40}
              />
            ) : (
              <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                {format.name}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
