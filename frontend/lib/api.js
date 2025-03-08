const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export async function fetchBackendData() {
  try {
    const res = await fetch(`${API_URL}/api`);
    if (!res.ok) {
      console.error(`API 요청 실패: ${res.status} ${res.statusText}`);
      return "백엔드 연결 실패 (API 응답 오류)";
    }
    return await res.text();
  } catch (error) {
    console.error("Error fetching API:", error);
    return "백엔드 연결 실패 (네트워크 오류)";
  }
}
