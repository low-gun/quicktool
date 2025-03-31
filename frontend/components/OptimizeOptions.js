// frontend/components/OptimizeOptions.js
export default function OptimizeOptions({
  quality,
  setQuality,
  resizeWidth,
  setResizeWidth,
  resizeHeight,
  setResizeHeight,
}) {
  return (
    <div
      style={{ background: "#fafafa", padding: "10px", borderRadius: "8px" }}
    >
      <h3>이미지 최적화 옵션</h3>
      <label>
        품질(1~100):
        <input
          type="number"
          value={quality}
          onChange={(e) => setQuality(e.target.value)}
          style={{ marginLeft: "8px", width: "80px" }}
        />
      </label>
      <br />
      <label>
        리사이즈 폭:
        <input
          type="number"
          value={resizeWidth}
          onChange={(e) => setResizeWidth(e.target.value)}
          style={{ marginLeft: "8px", width: "80px" }}
        />
      </label>
      <br />
      <label>
        리사이즈 높이:
        <input
          type="number"
          value={resizeHeight}
          onChange={(e) => setResizeHeight(e.target.value)}
          style={{ marginLeft: "8px", width: "80px" }}
        />
      </label>
    </div>
  );
}
