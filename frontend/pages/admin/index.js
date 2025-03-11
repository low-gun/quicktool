import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import jwtDecode from "jwt-decode";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [visitStats, setVisitStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("로그인이 필요합니다.");
      router.push("/login");
      return;
    }

    const decoded = JSON.parse(atob(token.split(".")[1]));
    if (decoded.role !== "admin") {
      alert("관리자 권한이 없습니다.");
      router.push("/");
      return;
    }

    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),

      fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/stats/visits`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
    ])
      .then(([userData, visitData]) => {
        setUsers(userData);
        setVisitStats(
          visitStats.map((item) => ({
            date: new Date(item.date).toLocaleDateString(),
            visits: item.visits,
          }))
        );
      })
      .catch((error) => {
        console.error("데이터 로딩 중 오류 발생", error);
        alert("관리자 데이터를 불러오는 데 실패했습니다.");
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  if (isLoading) {
    return <div>로딩 중...</div>;
  }

  return (
    <AdminLayout>
      <h1>관리자 대시보드</h1>

      <section>
        <h2>사용자 목록</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>이메일</th>
              <th>역할</th>
              <th>생성일</th>
              <th>수정일</th>
              <th>방문횟수</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>{new Date(user.updated_at).toLocaleDateString()}</td>
                <td>{user.visit_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section style={{ marginTop: "40px" }}>
        <h2>최근 30일 방문자 통계</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={visitStats}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="visits"
              stroke="#007bff"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>
    </AdminLayout>
  );
}
