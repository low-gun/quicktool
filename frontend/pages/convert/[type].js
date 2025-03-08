import { useRouter } from "next/router";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Layout from "../../components/layout";

export default function ConvertPage() {
  const router = useRouter();
  const { type } = router.query;

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [downloadUrls, setDownloadUrls] = useState([]);

  const onDrop = useCallback((acceptedFiles) => {
    setSelectedFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: true,
  });

  const handleConvert = async () => {
    if (selectedFiles.length === 0) {
      alert("파일을 선택해주세요.");
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));

    const response = await fetch(`http://localhost:5001/api/${type}`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.downloadUrls) {
      setDownloadUrls(
        result.downloadUrls.map((url) => `http://localhost:5001${url}`)
      );
    } else {
      alert("변환에 실패했습니다.");
    }
  };

  return (
    <Layout>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#333" }}>
        {type ? `${type.toUpperCase()} 변환` : "로딩 중..."}
      </h1>

      {/* 드래그 앤 드롭 영역 */}
      <div
        {...getRootProps()}
        style={{
          border: "2px dashed #ddd",
          padding: "30px",
          cursor: "pointer",
          background: "#ffffff",
          marginBottom: "20px",
          borderRadius: "10px",
          transition: "border 0.2s ease",
        }}
        onMouseOver={(e) => {
          if (e.currentTarget === e.target) {
            e.currentTarget.style.border = "2px dashed #007bff";
          }
        }}
        onMouseOut={(e) => {
          if (e.currentTarget === e.target) {
            e.currentTarget.style.border = "2px dashed #ddd";
          }
        }}
      >
        <input {...getInputProps()} />
        <p style={{ fontSize: "16px", color: "#666", margin: "0" }}>
          여기에 파일을 드래그 앤 드롭하거나 클릭하여 선택하세요.
        </p>
      </div>

      {/* 선택된 파일 리스트 */}
      {selectedFiles.length > 0 && (
        <div
          style={{
            background: "#ffffff",
            padding: "15px",
            borderRadius: "8px",
            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
            marginBottom: "20px",
            textAlign: "left",
            maxWidth: "600px",
            margin: "auto",
          }}
        >
          <h3 style={{ fontSize: "18px", color: "#333" }}>선택된 파일:</h3>
          <ul style={{ listStyle: "none", padding: "0" }}>
            {selectedFiles.map((file, index) => (
              <li key={index} style={{ fontSize: "16px", color: "#555" }}>
                {file.name}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 변환 버튼 */}
      <button
        onClick={handleConvert}
        style={{
          padding: "15px 30px",
          fontSize: "18px",
          cursor: "pointer",
          border: "none",
          borderRadius: "5px",
          background: "#007bff",
          color: "#fff",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          transition: "background 0.3s ease",
        }}
        onMouseOver={(e) => (e.target.style.background = "#0056b3")}
        onMouseOut={(e) => (e.target.style.background = "#007bff")}
      >
        변환하기
      </button>

      {downloadUrls.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <p style={{ fontSize: "18px", fontWeight: "bold", color: "#333" }}>
            변환 완료! 다운로드:
          </p>
          {downloadUrls.map((url, index) => (
            <div key={index}>
              <a
                href={url}
                download
                style={{
                  fontSize: "16px",
                  color: "#007bff",
                  textDecoration: "none",
                  fontWeight: "bold",
                  transition: "color 0.2s ease",
                }}
                onMouseOver={(e) => (e.target.style.color = "#0056b3")}
                onMouseOut={(e) => (e.target.style.color = "#007bff")}
              >
                {`파일 ${index + 1} 다운로드`}
              </a>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
