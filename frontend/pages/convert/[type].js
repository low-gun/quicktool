import { useRouter } from "next/router";
import { useState, useEffect, useCallback, useRef } from "react"; // 변경: useEffect 추가
import { useDropzone } from "react-dropzone";
import Layout from "../../components/layout";
import { formatAllowedExtensions } from "../../utils/formatHelper";
import allowedFormats from "../../utils/allowedFormats";
import ConvertOptions from "../../components/ConvertOptions"; // ✅ 추가

export default function ConvertPage() {
  const router = useRouter();
  const { type } = router.query;

  const [selectedFiles, setSelectedFiles] = useState([]);
  // 기존 downloadUrls 대체
  const [downloadData, setDownloadData] = useState([]);
  const [progress, setProgress] = useState(0);

  // 진행률 시뮬레이션 interval 보관용
  const progressIntervalRef = useRef(null);
  const [isConverting, setIsConverting] = useState(false);
  const [conversionType, setConversionType] = useState("image");
  const [isConversionRequired, setIsConversionRequired] = useState(false);

  // ─────────────────────────────────────────────────────
  // 드롭존 설정
  // ─────────────────────────────────────────────────────
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (!type || !allowedFormats[type]) {
        alert("변환 유형이 올바르지 않습니다.");
        return;
      }

      const validFiles = [];
      const invalidFiles = [];

      acceptedFiles.forEach((file) => {
        if (
          allowedFormats[type] === "*" ||
          allowedFormats[type].includes(file.type)
        ) {
          validFiles.push(file);
        } else {
          invalidFiles.push(file.name);
        }
      });

      if (invalidFiles.length > 0) {
        alert(
          `아래 파일은 허용되지 않는 파일 형식입니다:\n${invalidFiles.join(
            "\n"
          )}`
        );
        return;
      }

      setSelectedFiles((prevFiles) => [...prevFiles, ...validFiles]);
    },
    [type]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: true,
    noClick: false,
    disabled: false,
  });

  const inputProps = getInputProps();

  // ─────────────────────────────────────────────────────
  // 파일 삭제
  // ─────────────────────────────────────────────────────
  const handleRemoveFile = (index) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  // ─────────────────────────────────────────────────────
  // 변환에 필요한 UI 로직
  // ─────────────────────────────────────────────────────
  useEffect(() => {
    console.time("Type 설정 시간"); // ⏱️ 로딩 시간 측정 시작

    if (
      selectedFiles.length === 1 &&
      ["to-ppt", "to-excel"].includes(type) &&
      (selectedFiles[0]?.name.toLowerCase().endsWith(".pdf") ||
        selectedFiles[0]?.name.toLowerCase().endsWith(".docx"))
    ) {
      setIsConversionRequired(true);
    } else {
      setIsConversionRequired(false);
    }

    if (type) {
      console.timeEnd("Type 설정 시간"); // ⏱️ 로딩 시간 측정 종료
    }
  }, [selectedFiles, type]);

  useEffect(() => {
    if (
      selectedFiles.length === 1 &&
      ["to-ppt", "to-excel"].includes(type) &&
      (selectedFiles[0]?.name.toLowerCase().endsWith(".pdf") ||
        selectedFiles[0]?.name.toLowerCase().endsWith(".docx"))
    ) {
      setIsConversionRequired(true);
    } else {
      setIsConversionRequired(false);
    }
  }, [selectedFiles, type]);

  // ─────────────────────────────────────────────────────
  // 진행률 시뮬레이션
  // ─────────────────────────────────────────────────────
  const startProgressSimulation = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    setProgress(0);
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev < 90) {
          return prev + 5;
        } else {
          return prev;
        }
      });
    }, 300);
  };

  const stopProgressSimulation = () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  // ─────────────────────────────────────────────────────
  // 변환 요청
  // ─────────────────────────────────────────────────────
  const handleConvert = async () => {
    if (selectedFiles.length === 0) {
      alert("파일을 선택해주세요.");
      return;
    }

    setIsConverting(true);
    startProgressSimulation();

    const formData = new FormData();

    // 변환 방식 선택이 필요한 경우만 추가
    if (selectedFiles.length === 1 && ["to-ppt", "to-excel"].includes(type)) {
      const fileExtension = selectedFiles[0].name
        .split(".")
        .pop()
        .toLowerCase();
      if (["pdf", "docx"].includes(fileExtension)) {
        formData.append("conversionType", conversionType);
      }
    }

    // 단일 파일 / 다중 파일 처리
    if (
      selectedFiles.length === 1 &&
      ["to-ppt", "to-docx", "to-pdf"].includes(type)
    ) {
      formData.append("file", selectedFiles[0]);
    } else {
      selectedFiles.forEach((file) => {
        formData.append("files", file, file.name);
      });
    }

    try {
      console.log(
        "✅ 변환 요청 전송:",
        `${process.env.NEXT_PUBLIC_API_URL}/api/${type}`
      );
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/${type}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`서버 응답 오류: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ 백엔드 응답 데이터:", result);

      stopProgressSimulation();
      setProgress(100);

      // ─────────────────────────────────────────────────
      // result에 따라 downloadData 세팅
      // ─────────────────────────────────────────────────
      // 백엔드가 fileNames와 downloadUrls 모두 준 경우
      if (result.fileNames && result.downloadUrls) {
        const combinedData = result.downloadUrls.map((url, idx) => ({
          url: `${process.env.NEXT_PUBLIC_API_URL}${url}`,
          name: result.fileNames[idx], // 원본 파일명
        }));
        setDownloadData(combinedData);
      }
      // 백엔드가 downloadUrl만 준 경우(단일 파일)
      else if (result.downloadUrl) {
        setDownloadData([
          {
            url: `${process.env.NEXT_PUBLIC_API_URL}${result.downloadUrl}`,
            name: "변환된 파일", // 임시 표기
          },
        ]);
      }
      // 백엔드가 downloadUrls만 준 경우(다중 파일)
      else if (result.downloadUrls) {
        setDownloadData(
          result.downloadUrls.map((url, index) => ({
            url: `${process.env.NEXT_PUBLIC_API_URL}${url}`,
            name: `파일 ${index + 1}`, // 임시 표기
          }))
        );
      } else {
        console.error("❌ 변환 실패:", result);
        alert("변환에 실패했습니다.");
        setProgress(0);
      }
    } catch (error) {
      console.error("❌ 변환 요청 실패:", error);
      alert(`변환 요청 중 오류가 발생했습니다: ${error.message}`);
      stopProgressSimulation();
      setProgress(0);
    } finally {
      setTimeout(() => setIsConverting(false), 500);
    }
  };

  // ─────────────────────────────────────────────────────
  // 렌더링
  // ─────────────────────────────────────────────────────
  return (
    <Layout>
      {/* 제목 */}
      <h1
        style={{
          fontSize: "28px",
          fontWeight: "bold",
          marginBottom: "20px",
          textAlign: "center",
        }}
      >
        {type
          ? type.replace(/^to-/, "").toUpperCase() + "로 변환"
          : "로딩 중..."}
      </h1>

      {/* 변환 가능한 파일 유형 안내 */}
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

      {/* 드롭존 (파일 리스트 포함) */}
      <div
        {...getRootProps()}
        style={{
          boxSizing: "border-box",
          width: "100%",
          maxWidth: "770px",
          margin: "0 auto 20px",
          border: "2px dashed #007bff",
          padding: "30px",
          cursor: "pointer",
          background: "#f8f9fa",
          borderRadius: "12px",
          transition: "border 0.3s, background 0.3s",
          textAlign: "center",
          fontSize: "20px",
          color: "#007bff",
          fontWeight: "bold",
          minHeight: "50px",
          height: selectedFiles.length > 0 ? "auto" : "150px",
          overflowY: "auto",
          maxHeight: "400px",
          display: selectedFiles.length === 0 ? "flex" : "block",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseEnter={(e) => (e.target.style.background = "#e9f5ff")}
        onMouseLeave={(e) => (e.target.style.background = "#f8f9fa")}
      >
        <input {...inputProps} />

        {selectedFiles.length === 0 ? (
          <p style={{ margin: 0, background: "transparent" }}>
            파일을 드래그하거나 클릭하여 선택하세요.
          </p>
        ) : (
          <ul
            onMouseEnter={(e) => e.stopPropagation()}
            onMouseLeave={(e) => e.stopPropagation()}
            style={{ padding: 0, margin: 0, listStyle: "none" }}
          >
            {selectedFiles.map((file, index) => (
              <li
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 15px",
                  background: "#ffffff",
                  borderRadius: "6px",
                  marginBottom: "8px",
                  boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
                }}
              >
                <span style={{ color: "#555", fontSize: "14px" }}>
                  {file.name}
                </span>
                <button
                  style={{
                    border: "none",
                    background: "none",
                    color: "red",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFile(index);
                  }}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 변환 옵션 */}
      {isConversionRequired && (
        <ConvertOptions
          conversionType={conversionType}
          setConversionType={setConversionType}
        />
      )}

      {/* 변환 버튼 */}
      {selectedFiles.length > 0 && !isConverting && (
        <button
          onClick={handleConvert}
          style={{
            display: "block",
            width: "120px",
            height: "40px",
            margin: "0 auto",
            padding: "0px 0px 0px 0px",
            fontSize: "18px",
            border: "none",
            borderRadius: "8px",
            background: "#007bff",
            color: "#fff",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
            transition: "background 0.3s, transform 0.2s",
          }}
          onMouseEnter={(e) => (e.target.style.background = "#0056b3")}
          onMouseLeave={(e) => (e.target.style.background = "#007bff")}
        >
          변환하기
        </button>
      )}

      {/* 변환 진행률 */}
      {isConverting && (
        <div style={{ maxWidth: "600px", margin: "20px auto" }}>
          <div style={{ background: "#eee", borderRadius: "6px" }}>
            <div
              style={{
                width: `${progress}%`,
                background: "#007bff",
                height: "12px",
                borderRadius: "6px",
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <p
            style={{ fontSize: "16px", marginTop: "10px", textAlign: "center" }}
          >
            변환 진행률: {progress}%
          </p>
        </div>
      )}

      {/* 다운로드 목록 */}
      {downloadData.length > 0 && (
        <div
          style={{
            boxSizing: "border-box",
            width: "100%",
            maxWidth: "770px",
            margin: "20px auto",
            border: "2px dashed #28a745",
            padding: "30px",
            background: "#f8f9fa",
            borderRadius: "12px",
            transition: "border 0.3s, background 0.3s",
            textAlign: "center",
            fontSize: "16px",
            color: "#28a745",
            fontWeight: "bold",
          }}
        >
          <ul style={{ padding: 0, margin: 0, listStyle: "none" }}>
            {downloadData.map((file, index) => (
              <li
                key={index}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 15px",
                  background: "#ffffff",
                  borderRadius: "6px",
                  marginBottom: "8px",
                  boxShadow: "0px 2px 4px rgba(0,0,0,0.05)",
                }}
              >
                <span style={{ color: "#555", fontSize: "14px" }}>
                  {/* 원본 파일명 혹은 임시 이름 */}
                  {file.name || `파일 ${index + 1}`}
                </span>
                <a
                  href={encodeURI(file.url)}
                  download
                  style={{
                    padding: "8px 12px",
                    background: "#28a745",
                    color: "#fff",
                    borderRadius: "6px",
                    textDecoration: "none",
                    fontWeight: "bold",
                    transition: "background 0.3s",
                  }}
                  onMouseEnter={(e) => (e.target.style.background = "#218838")}
                  onMouseLeave={(e) => (e.target.style.background = "#28a745")}
                >
                  다운로드
                </a>
              </li>
            ))}
          </ul>
          {/* 전체 다운로드 버튼 */}
          <button
            onClick={() => {
              downloadData.forEach((file, index) => {
                setTimeout(() => {
                  const link = document.createElement("a");
                  link.href = encodeURI(file.url);
                  link.download = file.name || `파일${index + 1}`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }, 500 * index);
              });
            }}
            style={{
              marginTop: "20px",
              padding: "10px 15px",
              fontSize: "16px",
              width: "120px",
              height: "40px",
              background: "#28a745",
              color: "#fff",
              borderRadius: "6px",
              border: "none",
              cursor: "pointer",
              fontWeight: "bold",
              transition: "background 0.3s",
            }}
            onMouseEnter={(e) => (e.target.style.background = "#218838")}
            onMouseLeave={(e) => (e.target.style.background = "#28a745")}
          >
            전체 다운로드
          </button>
        </div>
      )}
    </Layout>
  );
}
