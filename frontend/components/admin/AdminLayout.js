import { useRouter } from "next/router";

export default function AdminLayout({ children }) {
  const router = useRouter();

  return (
    <div
      style={{
        maxWidth: "900px",
        margin: "40px auto",
        padding: "20px",
        background: "#f5f5f5",
        borderRadius: "8px",
      }}
    >
      <nav
        style={{
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <button
          onClick={() => router.push("/admin")}
          style={{
            cursor: "pointer",
            fontWeight: "bold",
            border: "none",
            background: "none",
          }}
        >
          관리자 홈
        </button>
        <button
          onClick={() => router.push("/")}
          style={{ cursor: "pointer", border: "none", background: "none" }}
        >
          사이트로 돌아가기
        </button>
      </nav>
      <main>{children}</main>
    </div>
  );
}
