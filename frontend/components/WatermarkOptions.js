// frontend/components/WatermarkOptions.js
export default function WatermarkOptions({ text, setText }) {
  return (
    <div
      style={{ background: "#fafafa", padding: "10px", borderRadius: "8px" }}
    >
      <h3>워터마크 옵션</h3>
      <label>
        워터마크 문자열:
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ marginLeft: "8px", width: "200px" }}
        />
      </label>
    </div>
  );
}
