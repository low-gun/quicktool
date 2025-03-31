// frontend/components/RotateOptions.js
export default function RotateOptions({ angle, setAngle }) {
  return (
    <div
      style={{ background: "#fafafa", padding: "10px", borderRadius: "8px" }}
    >
      <h3>이미지 회전 옵션</h3>
      <label>
        회전 각도:
        <input
          type="number"
          value={angle}
          onChange={(e) => setAngle(e.target.value)}
          style={{ marginLeft: "8px", width: "80px" }}
        />
      </label>
    </div>
  );
}
