import { useRouter } from "next/router";

export default function Navbar() {
  const router = useRouter();

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 20px",
        background: "#ffffff",
        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
      }}
    >
      <button
        onClick={() => router.push("/")}
        style={{
          fontSize: "20px",
          fontWeight: "bold",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "#000000",
        }}
      >
        QuickTool
      </button>

      <button
        onClick={() => router.push("/login")}
        style={{
          padding: "8px 16px",
          borderRadius: "5px",
          border: "none",
          cursor: "pointer",
          background: "#007bff",
          color: "#fff",
        }}
      >
        로그인
      </button>
    </nav>
  );
}
