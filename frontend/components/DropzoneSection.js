// frontend/components/DropzoneSection.js
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

export default function DropzoneSection({ selectedFiles, setSelectedFiles }) {
  const onDrop = useCallback(
    (acceptedFiles) => {
      // 파일형식 검증 등 추가 가능
      setSelectedFiles((prev) => [...prev, ...acceptedFiles]);
    },
    [setSelectedFiles]
  );

  const handleRemoveFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: true,
  });

  return (
    <div
      {...getRootProps()}
      style={{
        boxSizing: "border-box",
        width: "100%",
        maxWidth: "600px",
        margin: "20px auto",
        border: "2px dashed #007bff",
        padding: "30px",
        borderRadius: "12px",
        textAlign: "center",
        fontSize: "16px",
        color: "#007bff",
        cursor: "pointer",
        minHeight: "150px",
      }}
    >
      <input {...getInputProps()} />
      {selectedFiles.length === 0 ? (
        <p>파일을 드래그하거나 클릭하여 선택하세요.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {selectedFiles.map((file, idx) => (
            <li
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "8px",
                marginBottom: "6px",
                background: "#fff",
                borderRadius: "6px",
              }}
            >
              <span style={{ color: "#555" }}>{file.name}</span>
              <button
                type="button"
                style={{ background: "none", color: "red", border: "none" }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile(idx);
                }}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
