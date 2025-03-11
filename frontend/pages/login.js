import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Legend } from "recharts";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberEmail, setRememberEmail] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const rememberedEmail = localStorage.getItem("rememberedEmail");
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRemember(true);
    }
  }, []);

  const [remember, setRemember] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/login`,
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

      alert("로그인 성공");
      router.back();
    } else {
      alert(result.message);
    }
  };

  return (
    <div
      style={{ maxWidth: "400px", margin: "100px auto", textAlign: "center" }}
    >
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
