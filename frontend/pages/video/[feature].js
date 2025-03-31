import { useRouter } from "next/router";
import { useState, useRef } from "react";
import Layout from "../../components/layout";
import DropzoneSection from "../../components/DropzoneSection";
import ProgressBar from "../../components/ProgressBar";
import Toast from "../../components/Toast"; // 1) Toast 컴포넌트 임포트

/**
 * 동영상 기능별 페이지:
 *  - /video/resolution → 해상도 변환 (width, height)
 *  - /video/subtitle  → 자막 추가 (동영상+자막파일 2개)
 *  - /video/trim      → 일부 구간( startTime, duration ) 자르기
 */
export default function VideoFeaturePage() {
  const router = useRouter();
  const { feature } = router.query; // "resolution", "subtitle", "trim" 등

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [subtitleFile, setSubtitleFile] = useState([]); // 자막용 Dropzone
  const [downloadData, setDownloadData] = useState([]);

  const [progress, setProgress] = useState(0);
  const progressRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Toast 상태
  const [toastMsg, setToastMsg] = useState("");

  // 해상도용
  const [width, setWidth] = useState("1280");
  const [height, setHeight] = useState("720");

  // 트리밍용
  const [startTime, setStartTime] = useState("0"); // 초 단위
  const [duration, setDuration] = useState("10"); // 초 단위

  // 진행률 가짜 시뮬레이션
  const startProgress = () => {
    if (progressRef.current) clearInterval(progressRef.current);
    setProgress(0);
    progressRef.current = setInterval(() => {
      setProgress((prev) => (prev < 90 ? prev + 5 : prev));
    }, 300);
  };

  const stopProgress = () => {
    if (progressRef.current) {
      clearInterval(progressRef.current);
      progressRef.current = null;
    }
  };

  // 토스트 닫기
  const handleCloseToast = () => {
    setToastMsg("");
  };

  // 변환/업로드 요청
  const handleProcess = async () => {
    if (!feature) {
      setToastMsg("feature가 존재하지 않습니다.");
      return;
    }

    // 자막 기능
    if (feature === "subtitle") {
      if (selectedFiles.length === 0 || subtitleFile.length === 0) {
        setToastMsg("동영상 파일과 자막 파일을 업로드하세요.");
        return;
      }
    } else {
      // 해상도, 트림
      if (selectedFiles.length === 0) {
        setToastMsg("동영상 파일을 업로드하세요.");
        return;
      }
    }

    setIsProcessing(true);
    startProgress();

    // backend: /api/video/[feature]
    const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/api/video/${feature}`;

    const formData = new FormData();

    // 자막 기능이면 동영상+자막 2개
    if (feature === "subtitle") {
      formData.append("files", selectedFiles[0]);
      formData.append("files", subtitleFile[0]);
    } else {
      formData.append("files", selectedFiles[0]);
    }

    // 기능별 옵션
    if (feature === "resolution") {
      formData.append("width", width);
      formData.append("height", height);
    } else if (feature === "trim") {
      formData.append("startTime", startTime);
      formData.append("duration", duration);
    } else if (feature === "subtitle") {
      // 자막용 파라미터 필요 시 추가
      // formData.append("subLang", "en");
    }

    try {
      const res = await fetch(endpoint, { method: "POST", body: formData });
      if (!res.ok) throw new Error(`서버오류: ${res.status}`);

      const result = await res.json();
      stopProgress();
      setProgress(100);

      if (result.downloadUrl) {
        setDownloadData([
          {
            url: `${process.env.NEXT_PUBLIC_API_URL}${result.downloadUrl}`,
            name: "동영상 결과파일",
          },
        ]);
      } else {
        console.warn("알 수 없는 응답 형식:", result);
        setDownloadData([]);
      }
    } catch (err) {
      console.error("작업 실패:", err);
      setToastMsg(`작업 실패: ${err.message}`); // 2) 토스트로 에러 표시
      stopProgress();
      setProgress(0);
    } finally {
      setTimeout(() => setIsProcessing(false), 500);
    }
  };

  return (
    <Layout>
      {/* 3) Toast 컴포넌트 삽입 */}
      <Toast message={toastMsg} onClose={handleCloseToast} />

      <h1 style={{ textAlign: "center", marginTop: "30px" }}>
        비디오 {feature} 페이지
      </h1>

      {/* 동영상 파일 업로드 구간 */}
      <p style={{ textAlign: "center" }}>동영상 파일 업로드</p>
      <DropzoneSection
        selectedFiles={selectedFiles}
        setSelectedFiles={setSelectedFiles}
      />

      {/* 자막 기능일 때, 자막 파일 전용 업로드 구간 추가 */}
      {feature === "subtitle" && (
        <div style={{ marginTop: "20px" }}>
          <p style={{ textAlign: "center" }}>자막 파일 업로드 (예: .srt)</p>
          <DropzoneSection
            selectedFiles={subtitleFile}
            setSelectedFiles={setSubtitleFile}
          />
        </div>
      )}

      {/* 해상도 입력 */}
      {feature === "resolution" && (
        <div
          style={{
            maxWidth: "600px",
            margin: "20px auto",
            background: "#f0f0f0",
            padding: "15px",
            borderRadius: "6px",
          }}
        >
          <h3>해상도 설정</h3>
          <label style={{ marginRight: "10px" }}>
            Width:
            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
              style={{ marginLeft: "8px", width: "80px" }}
            />
          </label>

          <label>
            Height:
            <input
              type="number"
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              style={{ marginLeft: "8px", width: "80px" }}
            />
          </label>
        </div>
      )}

      {/* 트리밍 입력 */}
      {feature === "trim" && (
        <div
          style={{
            maxWidth: "600px",
            margin: "20px auto",
            background: "#f0f0f0",
            padding: "15px",
            borderRadius: "6px",
          }}
        >
          <h3>트리밍 옵션</h3>
          <label style={{ marginRight: "10px" }}>
            StartTime(초):
            <input
              type="number"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              style={{ marginLeft: "8px", width: "80px" }}
            />
          </label>

          <label>
            Duration(초):
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              style={{ marginLeft: "8px", width: "80px" }}
            />
          </label>
        </div>
      )}

      {/* 실행 버튼 */}
      {selectedFiles.length > 0 && !isProcessing && (
        <button
          onClick={handleProcess}
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
          실행하기
        </button>
      )}

      {/* 진행률 */}
      {isProcessing && <ProgressBar progress={progress} />}

      {/* 다운로드 영역 */}
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
                <span style={{ color: "#555" }}>동영상 결과파일 {idx + 1}</span>
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
