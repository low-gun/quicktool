import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function Navbar() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    // 토큰에서 role이 admin인지 확인하는 로직
    // if (token) {
    //   const decoded = jwtDecode(token);
    //   setIsAdmin(decoded.role === "admin");
    // } else {
    //   setIsAdmin(false);
    // }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setIsAdmin(false);
    router.push("/login");
  };

  return (
    // 부모 래퍼: 전체 배경 너비 100%
    <nav
      style={{
        width: "100%",
        background: "#ffffff",
      }}
    >
      {/* 내용 컨테이너: 가로 최대 960px 고정 폭, 중앙 정렬 */}
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto", // 중앙 정렬
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "15px 20px",
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
                color: "#fff",
                background: "#007bff", // 로그아웃 버튼에도 파란색 배경 주려면
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
      </div>
    </nav>
  );
}
