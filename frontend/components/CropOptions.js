// frontend/components/CropOptions.js
export default function CropOptions({
  left,
  setLeft,
  top,
  setTop,
  width,
  setWidth,
  height,
  setHeight,
}) {
  return (
    <div
      style={{ background: "#fafafa", padding: "10px", borderRadius: "8px" }}
    >
      <h3>이미지 자르기 옵션</h3>
      <div>
        <label>
          Left:
          <input
            type="number"
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            style={{ marginLeft: "8px", width: "80px" }}
          />
        </label>
      </div>
      <div>
        <label>
          Top:
          <input
            type="number"
            value={top}
            onChange={(e) => setTop(e.target.value)}
            style={{ marginLeft: "8px", width: "80px" }}
          />
        </label>
      </div>
      <div>
        <label>
          Width:
          <input
            type="number"
            value={width}
            onChange={(e) => setWidth(e.target.value)}
            style={{ marginLeft: "8px", width: "80px" }}
          />
        </label>
      </div>
      <div>
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
    </div>
  );
}
