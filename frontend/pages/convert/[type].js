import { useRouter } from "next/router";
import { useState, useRef } from "react";
import Layout from "../../components/layout";
import DropzoneSection from "../../components/DropzoneSection";
import ProgressBar from "../../components/ProgressBar";
import allowedFormats from "../../utils/allowedFormats";
import Toast from "../../components/Toast"; // Toast 컴포넌트 임포트

// 긴 MIME을 간단한 이름으로 매핑
const friendlyMimeNames = {
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    "DOCX",
  "text/plain": "TXT",
  "application/x-hwp": "HWP",
  "image/png": "PNG",
  "image/jpeg": "JPEG",
  "image/gif": "GIF",
  "image/bmp": "BMP",
  "image/tiff": "TIFF",
  "image/webp": "WEBP",
  "image/svg+xml": "SVG",
  "application/vnd.ms-excel": "XLS",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
  "application/vnd.ms-powerpoint": "PPT",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "PPTX",
  "text/markdown": "MARKDOWN",
  "text/html": "HTML",
  "text/csv": "CSV",
  "application/rtf": "RTF",
  "application/epub+zip": "EPUB",
  "application/pdf": "PDF",
  "image/vnd.adobe.photoshop": "PSD",
};

function formatAllowedExtensions(mimes) {
  return mimes
    .map((mime) => {
      if (friendlyMimeNames[mime]) {
        return friendlyMimeNames[mime];
      }
      const ext = mime.split("/").pop();
      return ext ? ext.toUpperCase() : mime;
    })
    .join(", ");
}

export default function ConvertPage() {
  const router = useRouter();
  const { type } = router.query;

  // Toast 메시지 상태
  const [toastMsg, setToastMsg] = useState("");

  // 업로드된 파일
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [downloadData, setDownloadData] = useState([]);

  // 진행률
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  const [isConverting, setIsConverting] = useState(false);

  // PDF 옵션 상태
  const [angle, setAngle] = useState(90);
  const [mode, setMode] = useState("merge");
  const [watermarkText, setWatermarkText] = useState("WATERMARK");
  const [pdfPassword, setPdfPassword] = useState("1234");

  // 진행률 시뮬레이션
  const startProgress = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
    }
    setProgress(0);
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 5 : prev));
    }, 300);
  };

  const stopProgress = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  // Toast 닫기
  const handleCloseToast = () => {
    setToastMsg("");
  };

  // 변환 요청
  const handleConvert = async () => {
    if (!type || selectedFiles.length === 0) {
      setToastMsg("타입 또는 파일을 확인하세요.");
      return;
    }

    setIsConverting(true);
    startProgress();

    let endpoint = "";
    if (type === "pdf-rotate") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/pdf/rotate`;
    } else if (type === "pdf-merge-split") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/pdf/merge-split`;
    } else if (type === "pdf-watermark") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/pdf/watermark`;
    } else if (type === "pdf-encrypt") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/pdf/encrypt`;
    } else if (type === "ocr") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/ocr/extract`;
    } else if (type === "to-avi") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/to-avi`;
    } else if (type === "to-bmp") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/to-bmp`;
    } else if (type === "to-csv") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/to-csv`;
    } else if (type === "to-docx") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/to-docx`;
    } else if (type === "to-excel") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/to-excel`;
    } else if (type === "to-gif") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/to-gif`;
    } else if (type === "to-heic") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/to-heic`;
    } else if (type === "to-html") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/to-html`;
    } else if (type === "to-hwp") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/to-hwp`;
    } else if (type === "to-jpeg") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/to-jpeg`;
    } else if (type === "to-json") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/to-json`;
    } else if (type === "to-mkv") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/to-mkv`;
    } else if (type === "to-mov") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/to-mov`;
    } else if (type === "to-mp3") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/to-mp3`;
    } else if (type === "to-mp4") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/to-mp4`;
    } else if (type === "to-pdf") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/to-pdf`;
    } else if (type === "to-png") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/to-png`;
    } else if (type === "to-ppt") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/to-ppt`;
    } else if (type === "to-svg") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/to-svg`;
    } else if (type === "to-tiff") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/to-tiff`;
    } else if (type === "to-txt") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/to-txt`;
    } else if (type === "to-wav") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/to-wav`;
    } else if (type === "to-webp") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/to-webp`;
    } else if (type === "to-xml") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/to-xml`;
    } else if (type === "to-zip") {
      endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/to-zip`;
    } else {
      setToastMsg(`지원하지 않는 type: ${type}`);
      stopProgress();
      setIsConverting(false);
      return;
    }

    // 폼데이터 구성
    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));

    // 기능별 옵션
    if (type === "pdf-rotate") {
      formData.append("angle", angle);
    } else if (type === "pdf-merge-split") {
      formData.append("mode", mode);
    } else if (type === "pdf-watermark") {
      formData.append("text", watermarkText);
    } else if (type === "pdf-encrypt") {
      formData.append("password", pdfPassword);
    } else if (type === "ocr") {
      // e.g. formData.append("lang", "eng");
    }

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error(`서버오류: ${res.status}`);

      const result = await res.json();
      stopProgress();
      setProgress(100);

      // 응답 처리
      if (result.downloadUrl) {
        // 단일 URL일 경우, 문자열 파싱
        const rawUrl = result.downloadUrl;
        const filename = rawUrl.split("/").pop() || "결과파일";
        const cleanedName = filename.replace(/^[a-f0-9-]+_/, "");
        setDownloadData([
          {
            url: `${process.env.NEXT_PUBLIC_API_URL}${rawUrl}`,
            name: cleanedName,
          },
        ]);
      } else if (result.downloadUrls) {
        // 다중 URL
        const dataArr = result.downloadUrls.map((rawUrl) => {
          const filename = rawUrl.split("/").pop() || "결과파일";
          const cleanedName = filename.replace(/^[a-f0-9-]+_/, "");
          return {
            url: `${process.env.NEXT_PUBLIC_API_URL}${rawUrl}`,
            name: cleanedName,
          };
        });
        setDownloadData(dataArr);
      } else if (result.recognizedText) {
        alert(`OCR 인식 결과: \n${result.recognizedText}`);
      } else {
        console.warn("알 수 없는 응답 형식:", result);
        setDownloadData([]);
      }
    } catch (err) {
      console.error("작업 실패:", err);
      setToastMsg(`작업 실패: ${err.message}`); // ← 토스트로 에러 표시
      stopProgress();
      setProgress(0);
    } finally {
      setTimeout(() => setIsConverting(false), 500);
    }
  };

  return (
    <Layout>
      {/* Toast 컴포넌트 삽입 (맨 위에) */}
      <Toast message={toastMsg} onClose={handleCloseToast} />

      <h1 style={{ textAlign: "center", marginTop: "30px" }}>
        {type ? `${type}` : "로딩 중..."}
      </h1>

      {/* 업로드 파일 형식 안내 */}
      {allowedFormats[type] && (
        <p
          style={{
            fontSize: "16px",
            color: "#555",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          업로드 파일형식:{" "}
          {allowedFormats[type] === "*"
            ? "모든 파일 형식"
            : formatAllowedExtensions(allowedFormats[type])}
        </p>
      )}

      <DropzoneSection
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
      />

      {/* PDF 옵션들 */}
      <div style={{ maxWidth: "600px", margin: "20px auto" }}>
        {type === "pdf-rotate" && (
          <div
            style={{
              marginBottom: "20px",
              background: "#f0f0f0",
              padding: "15px",
              borderRadius: "6px",
            }}
          >
            <h3>PDF 회전</h3>
            <label>
              각도:
              <input
                type="number"
                value={angle}
                onChange={(e) => setAngle(parseInt(e.target.value, 10))}
                style={{ marginLeft: "8px", width: "80px" }}
              />
            </label>
          </div>
        )}

        {type === "pdf-merge-split" && (
          <div
            style={{
              marginBottom: "20px",
              background: "#f0f0f0",
              padding: "15px",
              borderRadius: "6px",
            }}
          >
            <h3>PDF 병합/분할</h3>
            <div>
              <label>
                <input
                  type="radio"
                  checked={mode === "merge"}
                  onChange={() => setMode("merge")}
                />
                병합 (여러 PDF 업로드)
              </label>
            </div>
            <div>
              <label>
                <input
                  type="radio"
                  checked={mode === "split"}
                  onChange={() => setMode("split")}
                />
                분할 (한 개 PDF 업로드)
              </label>
            </div>
          </div>
        )}

        {type === "pdf-watermark" && (
          <div
            style={{
              marginBottom: "20px",
              background: "#f0f0f0",
              padding: "15px",
              borderRadius: "6px",
            }}
          >
            <h3>PDF 워터마크</h3>
            <label>
              텍스트:
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                style={{ marginLeft: "8px", width: "200px" }}
              />
            </label>
          </div>
        )}

        {type === "pdf-encrypt" && (
          <div
            style={{
              marginBottom: "20px",
              background: "#f0f0f0",
              padding: "15px",
              borderRadius: "6px",
            }}
          >
            <h3>PDF 암호화</h3>
            <label>
              비밀번호:
              <input
                type="text"
                value={pdfPassword}
                onChange={(e) => setPdfPassword(e.target.value)}
                style={{ marginLeft: "8px", width: "120px" }}
              />
            </label>
          </div>
        )}

        {type === "ocr" && (
          <div
            style={{
              marginBottom: "20px",
              background: "#f0f0f0",
              padding: "15px",
              borderRadius: "6px",
            }}
          >
            <h3>이미지 OCR</h3>
            <p>이미지 → 텍스트 변환</p>
          </div>
        )}
      </div>

      {selectedFiles.length > 0 && !isConverting && (
        <button
          onClick={handleConvert}
          style={{
            display: "block",
            margin: "0 auto",
            padding: "12px 20px",
            fontSize: "16px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          실행하기
        </button>
      )}

      {isConverting && <ProgressBar progress={progress} />}

      {downloadData.length > 0 && (
        <div
          style={{
            width: "100%",
            maxWidth: "600px",
            margin: "20px auto",
            border: "2px dashed #28a745",
            padding: "20px",
            borderRadius: "12px",
            textAlign: "center",
          }}
        >
          <ul style={{ listStyle: "none", padding: 0 }}>
            {downloadData.map((file, idx) => (
              <li
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "8px",
                  background: "#ffffff",
                  borderRadius: "6px",
                  marginBottom: "6px",
                }}
              >
                <span style={{ color: "#555" }}>{file.name}</span>
                <a
                  href={file.url}
                  download
                  style={{
                    background: "#28a745",
                    color: "#fff",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    textDecoration: "none",
                  }}
                >
                  다운로드
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Layout>
  );
}
