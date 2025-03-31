// frontend/pages/cloud/[provider].js

import { useRouter } from "next/router";
import { useState, useRef } from "react";
import Layout from "../../components/layout";
import DropzoneSection from "../../components/DropzoneSection";
import ProgressBar from "../../components/ProgressBar";
import Toast from "../../components/Toast"; // Toast가 있다면

export default function CloudProviderPage() {
  const router = useRouter();
  const { provider } = router.query;
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadData, setUploadData] = useState(null);

  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  // Toast 상태 (있다면)
  const [toastMsg, setToastMsg] = useState("");

  const handleCloseToast = () => setToastMsg("");

  // 진행률 시뮬레이션
  const startProgress = () => {
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
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

  const handleUpload = async () => {
    if (!provider) {
      setToastMsg("provider가 존재하지 않습니다.");
      return;
    }
    if (selectedFiles.length === 0) {
      setToastMsg("업로드할 파일을 선택하세요.");
      return;
    }

    setIsUploading(true);
    startProgress();

    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/cloud/${provider}`;
    const formData = new FormData();
    formData.append("files", selectedFiles[0]);

    try {
      const res = await fetch(endpoint, { method: "POST", body: formData });
      if (!res.ok) throw new Error(`서버오류: ${res.status}`);

      const result = await res.json();
      stopProgress();
      setProgress(100);

      // result에 shareLink 등이 들어있을 수 있음
      setUploadData(result);
    } catch (err) {
      console.error("업로드 실패:", err);
      setToastMsg(`업로드 실패: ${err.message}`);
      stopProgress();
      setProgress(0);
    } finally {
      setTimeout(() => setIsUploading(false), 500);
    }
  };

  // 공유 링크 복사 기능
  const copyLink = () => {
    if (uploadData?.shareLink) {
      navigator.clipboard
        .writeText(uploadData.shareLink)
        .then(() => setToastMsg("공유 링크가 복사되었습니다."))
        .catch((err) => setToastMsg("클립보드 복사 오류: " + err.message));
    }
  };

  return (
    <Layout>
      <Toast message={toastMsg} onClose={handleCloseToast} />

      <h1 style={{ textAlign: "center", marginTop: "30px" }}>
        클라우드 {provider} 업로드
      </h1>

      <p style={{ textAlign: "center" }}>
        이 페이지에서는 {provider}로 파일 업로드를 진행합니다.
      </p>

      <DropzoneSection
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
      />

      {selectedFiles.length > 0 && !isUploading && (
        <button
          onClick={handleUpload}
          style={{
            display: "block",
            margin: "20px auto",
            padding: "12px 20px",
            fontSize: "16px",
            background: "#007bff",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
          }}
        >
          업로드하기
        </button>
      )}

      {isUploading && <ProgressBar progress={progress} />}

      {/* 응답 영역 */}
      {uploadData && (
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
          <h3>응답 결과</h3>
          <pre
            style={{
              textAlign: "left",
              background: "#f8f8f8",
              padding: "10px",
              borderRadius: "6px",
            }}
          >
            {JSON.stringify(uploadData, null, 2)}
          </pre>

          {uploadData.shareLink && (
            <div style={{ marginTop: "10px" }}>
              <p>
                공유 링크:{" "}
                <a href={uploadData.shareLink} target="_blank" rel="noreferrer">
                  {uploadData.shareLink}
                </a>
              </p>
              <button
                onClick={copyLink}
                style={{
                  padding: "8px 16px",
                  background: "#007bff",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                링크 복사
              </button>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}
