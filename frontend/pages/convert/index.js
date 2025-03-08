import { useRouter } from "next/router";

const formats = [
  { name: "JPEG", type: "to-jpeg", image: "" },
  { name: "PNG", type: "to-png", image: "" },
  { name: "GIF", type: "to-gif", image: "" },
  { name: "TIFF", type: "to-tiff", image: "" },
  { name: "BMP", type: "to-bmp", image: "" },
  { name: "WEBP", type: "to-webp", image: "" },
  { name: "SVG", type: "to-svg", image: "" },
  { name: "HEIC", type: "to-heic", image: "" },
  { name: "PDF", type: "to-pdf", image: "" },
  { name: "DOCX", type: "to-docx", image: "" },
  { name: "TXT", type: "to-txt", image: "" },
  { name: "ZIP", type: "to-zip", image: "" },
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
        background: "#f4f4f4",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
      }}
    >
      <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#333" }}>
        파일 변환
      </h1>
      <p style={{ fontSize: "16px", color: "#666", marginBottom: "20px" }}>
        원하는 변환 형식을 선택하세요.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "15px",
          justifyContent: "center",
          maxWidth: "600px",
          margin: "auto",
        }}
      >
        {formats.map((format) => (
          <button
            key={format.type}
            onClick={() => handleConvertClick(format.type)}
            style={{
              padding: "15px",
              fontSize: "16px",
              cursor: "pointer",
              border: "none",
              borderRadius: "8px",
              background: "#ffffff",
              textAlign: "center",
              boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
              transition: "transform 0.2s ease",
              color: "#000",
            }}
            onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
            onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
          >
            {format.image ? (
              <img
                src={format.image}
                alt={format.name}
                style={{ width: "50px", height: "50px" }}
              />
            ) : (
              <span>{format.name}</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
