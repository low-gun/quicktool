import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    if (token) {
      const decoded = jwtDecode(token);
      setIsAdmin(decoded.role === "admin");
    } else {
      setIsAdmin(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setIsAdmin(false);
    router.push("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 20px",
        background: "#ffffff",
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

      <div style={{ display: "flex", gap: "10px" }}>
        {isAdmin && (
          <button
            onClick={() => router.push("/admin")}
            style={{
              padding: "8px 16px",
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
              background: "#6c757d",
              color: "#fff",
            }}
          >
            관리자
          </button>
        )}

        {isLoggedIn ? (
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              borderRadius: "5px",
              border: "none",
              cursor: "pointer",
              color: "#007bff",
            }}
          >
            로그아웃
          </button>
        ) : (
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
        )}
      </div>
    </nav>
  );
}
