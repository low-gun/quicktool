import { useRouter } from "next/router";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import Layout from "../../components/layout";
import allowedFormats from "../../utils/allowedFormats";
export default function ConvertPage() {
  const router = useRouter();
  const { type } = router.query;

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [downloadUrls, setDownloadUrls] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isConverting, setIsConverting] = useState(false);

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
  });

  const handleRemoveFile = (index) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleConvert = async () => {
    if (selectedFiles.length === 0) {
      alert("파일을 선택해주세요.");
      return;
    }

    setIsConverting(true);
    setProgress(20);

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));

    try {
      setProgress(50);
      const response = await fetch(`http://localhost:5001/api/${type}`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setProgress(80);

      if (result.downloadUrls) {
        setDownloadUrls(
          result.downloadUrls.map((url) => `http://localhost:5001${url}`)
        );
        setProgress(100);
      } else {
        alert("변환에 실패했습니다.");
        setProgress(0);
      }
    } catch (error) {
      console.error(error);
      setProgress(0);
    } finally {
      setTimeout(() => setIsConverting(false), 500);
    }
  };

  return (
    <Layout>
      <h1
        style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "20px" }}
      >
        {type ? `${type.toUpperCase()}` : "로딩 중..."}
      </h1>

      <div
        {...getRootProps()}
        style={{
          border: "2px dashed #ddd",
          padding: "30px",
          cursor: "pointer",
          background: "#ffffff",
          marginBottom: "20px",
          borderRadius: "10px",
          transition: "border 0.3s",
        }}
      >
        <input {...getInputProps()} />
        <p style={{ fontSize: "16px", color: "#666", margin: "0" }}>
          파일을 드래그하거나 클릭하여 선택하세요.
        </p>
      </div>

      {selectedFiles.length > 0 && (
        <div
          style={{
            width: "100%",
            maxWidth: "770px",
            margin: "0 auto 20px auto",
            padding: "15px",
            background: "#ffffff",
            borderRadius: "8px",
            boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              marginBottom: "10px",
            }}
          >
            선택된 파일:
          </h2>
          <ul style={{ padding: 0, margin: 0 }}>
            {selectedFiles.map((file, index) => (
              <li
                key={index}
                style={{
                  listStyle: "none",
                  color: "#555",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                {file.name}
                <button
                  style={{
                    border: "none",
                    background: "none",
                    color: "red",
                    cursor: "pointer",
                  }}
                  onClick={() => handleRemoveFile(index)}
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {selectedFiles.length > 0 && !isConverting && (
        <button
          onClick={handleConvert}
          style={{
            padding: "15px 30px",
            fontSize: "18px",
            border: "none",
            borderRadius: "5px",
            background: "#007bff",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          변환하기
        </button>
      )}

      {isConverting && (
        <div style={{ maxWidth: "600px", margin: "20px auto" }}>
          <div style={{ background: "#eee", borderRadius: "5px" }}>
            <div
              style={{
                width: `${progress}%`,
                background: "#007bff",
                height: "12px",
                borderRadius: "5px",
                transition: "width 0.3s ease",
              }}
            />
          </div>
          <p style={{ fontSize: "16px", marginTop: "10px" }}>
            변환 진행률: {progress}%
          </p>
        </div>
      )}

      {downloadUrls.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3 style={{ fontWeight: "bold" }}>다운로드:</h3>
          {downloadUrls.map((url, index) => (
            <div key={index}>
              <a href={url} download>
                파일 {index + 1} 다운로드
              </a>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}
