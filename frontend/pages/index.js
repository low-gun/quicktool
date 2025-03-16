import { useRouter } from "next/router";
import Layout from "../components/layout";

export default function Home({ backendMessage }) {
  const router = useRouter();

  return (
    <Layout>
      <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "#333" }}>
        🚧 준비중 🚧
      </h1>
      <p style={{ fontSize: "18px", color: "#555" }}>
        원하는 파일 형식으로 쉽게 변환하세요!
      </p>
      <button
        onClick={() => router.push("/convert")}
        style={{
          padding: "15px 30px",
          fontSize: "18px",
          cursor: "pointer",
          border: "none",
          borderRadius: "5px",
          background: "#007bff",
          color: "white",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          transition: "background 0.3s ease",
        }}
        onMouseOver={(e) => (e.target.style.background = "#0056b3")}
        onMouseOut={(e) => (e.target.style.background = "#007bff")}
      >
        파일 변환 시작하기
      </button>
    </Layout>
  );
}

// 서버에서 API 요청하여 데이터를 받아옴 (캐싱 적용)
export async function getServerSideProps() {
  let backendMessage = "백엔드 연결 실패";

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api`);
    const data = await res.json();
    backendMessage = data.message;
  } catch (error) {
    console.error("Backend API 요청 실패:", error);
  }

  return { props: { backendMessage } };
}
