import React from "react";

export default function ConvertOptions({ conversionType, setConversionType }) {
  return (
    <div style={{ marginBottom: "20px" }}>
      <h3
        style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "10px" }}
      >
        변환 방식 선택:
      </h3>
      <label style={{ marginRight: "15px" }}>
        <input
          type="radio"
          name="conversionType"
          value="image"
          checked={conversionType === "image"}
          onChange={() => setConversionType("image")}
        />
        디자인 유지 (이미지 변환)
      </label>
      <label>
        <input
          type="radio"
          name="conversionType"
          value="text"
          checked={conversionType === "text"}
          onChange={() => setConversionType("text")}
        />
        텍스트 변환
      </label>
    </div>
  );
}
