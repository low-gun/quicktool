import { useState, useEffect } from "react";
import { useRouter } from "next/router";
// import { Legend } from "recharts"; // 사용하지 않으면 제거해도 됩니다.
import Toast from "../components/Toast"; // 1) Toast 임포트

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberEmail, setRememberEmail] = useState(false);
  const router = useRouter();

  const [remember, setRemember] = useState(false);
  const [toastMsg, setToastMsg] = useState(""); // 2) 토스트 메시지 상태

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRemember(true);
    }
  }, []);

  // 토스트 닫기
  const handleCloseToast = () => {
    setToastMsg("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/users/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        }
      );

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("token", result.token);

        if (remember) {
          localStorage.setItem("rememberedEmail", email); // 이메일 기억
        } else {
          localStorage.removeItem("rememberedEmail"); // 이메일 삭제
        }

        // 3) 로그인 성공 → 토스트로 안내
        setToastMsg("로그인 성공!");
        // 로그인 후 뒤로 가기(혹은 메인 페이지로 이동)
        router.back();
      } else {
        // 4) 서버에서 내려준 오류 메시지를 토스트로 표시
        setToastMsg(result.message || "로그인 실패");
      }
    } catch (err) {
      console.error(err);
      setToastMsg(`로그인 중 오류: ${err.message}`);
    }
  };

  return (
    <div
      style={{ maxWidth: "400px", margin: "100px auto", textAlign: "center" }}
    >
      {/* 5) Toast 컴포넌트 표시 */}
      <Toast message={toastMsg} onClose={handleCloseToast} />

      <h2>로그인</h2>
      <form
        onSubmit={handleLogin}
        style={{ display: "flex", flexDirection: "column", gap: "10px" }}
      >
        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "10px" }}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: "10px" }}
        />

        <label style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
          />
          계정정보 기억하기
        </label>

        <button
          type="submit"
          style={{
            padding: "10px",
            background: "#007bff",
            color: "#fff",
            cursor: "pointer",
            border: "none",
          }}
        >
          로그인
        </button>
      </form>

      <button
        style={{
          marginTop: "20px",
          padding: "10px",
          cursor: "pointer",
          border: "none",
          background: "none",
          color: "#007bff",
          textDecoration: "underline",
        }}
        onClick={() => router.push("/register")}
      >
        회원가입
      </button>
    </div>
  );
}
