// frontend/pages/index.js (Next.js 메인 홈)

// 1) Toast 임포트
import { useRouter } from "next/router";
import Image from "next/image";
import React, { useState } from "react";
import Toast from "../components/Toast";

// 예시 메뉴: 기존 6개 그룹 + 비디오 도구 + 클라우드 업로드 + 메모장 = 총 9개
const groupedFormats = [
  {
    category: "문서 변환",
    items: [
      { name: "PDF", type: "/convert/to-pdf" },
      { name: "DOCX", type: "/convert/to-docx" },
      { name: "XLSX", type: "/convert/to-excel" },
      { name: "PPT", type: "/convert/to-ppt" },
    ],
  },
  {
    category: "이미지 변환",
    items: [
      { name: "JPEG", type: "/convert/to-jpeg" },
      { name: "PNG", type: "/convert/to-png" },
      { name: "GIF", type: "/convert/to-gif" },
      { name: "HEIC", type: "/convert/to-heic" },
      { name: "WEBP", type: "/convert/to-webp" },
      { name: "SVG", type: "/convert/to-svg" },
      { name: "TIFF", type: "/convert/to-tiff" },
      { name: "BMP", type: "/convert/to-bmp" },
    ],
  },
  {
    category: "영상·오디오 변환",
    items: [
      { name: "MP4", type: "/convert/to-mp4" },
      { name: "MOV", type: "/convert/to-mov" },
      { name: "MKV", type: "/convert/to-mkv" },
      { name: "AVI", type: "/convert/to-avi" },
      { name: "MP3", type: "/convert/to-mp3" },
      { name: "WAV", type: "/convert/to-wav" },
    ],
  },
  {
    category: "이미지 편집",
    items: [
      { name: "Optimize", type: "/convert/image-optimize" },
      { name: "Crop", type: "/convert/image-crop" },
      { name: "Rotate", type: "/convert/image-rotate" },
      { name: "Watermark", type: "/convert/image-watermark" },
    ],
  },
  {
    category: "PDF편집",
    items: [
      { name: "암호화", type: "/convert/pdf-encrypt" },
      { name: "병합·분할", type: "/convert/pdf-merge-split" },
      { name: "회전", type: "/convert/pdf-rotate" },
      { name: "워터마크", type: "/convert/pdf-watermark" },
    ],
  },
  {
    category: "OCR",
    items: [{ name: "이미지→텍스트", type: "/convert/ocr" }],
  },
  {
    category: "영상편집",
    items: [
      { name: "해상도 변경", type: "/video/resolution" },
      { name: "자막 추가", type: "/video/subtitle" },
      { name: "트리밍", type: "/video/trim" },
    ],
  },
  {
    category: "클라우드 업로드",
    items: [
      { name: "Dropbox", type: "/cloud/dropbox" },
      { name: "GoogleDrive", type: "/cloud/google-drive" },
      { name: "OneDrive", type: "/cloud/one-drive" },
    ],
  },
  // (추가) 메모장
  {
    category: "메모장",
    items: [{ name: "내 메모 보기/편집", type: "/notes" }],
  },
];

export default function ConvertHome() {
  const router = useRouter();

  // 2) 토스트 메시지 상태
  const [toastMsg, setToastMsg] = useState("");

  // 토스트 닫기
  const handleCloseToast = () => {
    setToastMsg("");
  };

  const handleClick = (destination) => {
    if (!destination) {
      // 3) 예시: destination이 없으면 토스트로 안내
      setToastMsg("올바르지 않은 기능입니다.");
      return;
    }
    router.push(destination);
  };

  return (
    <div
      style={{
        textAlign: "center",
        marginTop: "50px",
        background: "#f9f9f9",
        padding: "30px",
        borderRadius: "12px",
        boxShadow: "0px 4px 8px rgba(0,0,0,0.1)",
        maxWidth: "900px",
        margin: "auto",
      }}
    >
      {/* 4) Toast 표시 */}
      <Toast message={toastMsg} onClose={handleCloseToast} />

      <h1 style={{ fontSize: "30px", fontWeight: "bold", color: "#333" }}>
        변환·편집 선택
      </h1>
      <p style={{ fontSize: "18px", color: "#666", marginBottom: "25px" }}>
        원하는 카테고리를 클릭 후, 변환/편집/업로드 기능을 선택하세요.
      </p>

      {groupedFormats.map((group, idx) => (
        <div key={idx} style={{ marginBottom: "40px" }}>
          <h2
            style={{ fontSize: "24px", color: "#007bff", marginBottom: "15px" }}
          >
            {group.category}
          </h2>
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
            {group.items.map((item) => (
              <button
                key={item.type}
                onClick={() => handleClick(item.type)}
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
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "scale(1.07)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={40}
                    height={40}
                  />
                ) : (
                  <span style={{ fontSize: "16px", fontWeight: "bold" }}>
                    {item.name}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
