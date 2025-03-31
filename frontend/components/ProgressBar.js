// frontend/components/ProgressBar.js
export default function ProgressBar({ progress }) {
  return (
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
      <p style={{ textAlign: "center", marginTop: "8px" }}>
        진행률: {progress}%
      </p>
    </div>
  );
}
