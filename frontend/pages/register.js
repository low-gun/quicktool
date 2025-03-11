import { useState } from "react";
import { useRouter } from "next/router";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/users/register`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );

    const result = await response.json();

    if (response.ok) {
      alert("회원가입이 완료되었습니다.");
      router.push("/login");
    } else {
      alert(result.message);
    }
  };

  return (
    <div
      style={{ maxWidth: "400px", margin: "100px auto", textAlign: "center" }}
    >
      <h2>회원가입</h2>
      <form
        onSubmit={handleRegister}
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
        <button
          type="submit"
          style={{
            padding: "10px",
            background: "#28a745",
            color: "#fff",
            cursor: "pointer",
            border: "none",
          }}
        >
          가입하기
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
        onClick={() => router.push("/login")}
      >
        로그인 페이지로 돌아가기
      </button>
    </div>
  );
}
