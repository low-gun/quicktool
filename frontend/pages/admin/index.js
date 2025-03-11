import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";
import AdminLayout from "../../components/admin/AdminLayout";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
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

    const decoded = jwtDecode(token);

    if (decoded.role !== "admin") {
      alert("관리자 권한이 없습니다.");
      router.push("/");
      return;
    }

    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/stats/visits`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((res) => res.json()),
    ])
      .then(([userData, visitData]) => {
        setUsers(userData);
        setVisitStats(
          visitData.map((item) => ({
            date: new Date(item.date).toLocaleDateString(),
            visits: item.visits,
          }))
        );
      })
      .catch((error) => {
        console.error(error);
        alert("데이터를 가져오는 중 오류가 발생했습니다.");
      })
      .finally(() => setIsLoading(false));
  }, [router]);

  if (isLoading) {
    return <div>로딩 중입니다...</div>;
  }

  return (
    <AdminLayout>
      <h1>관리자 대시보드</h1>

      <section>
        <h2>사용자 목록</h2>
        <table width="100%" border="1" cellPadding="8">
          <thead>
            <tr>
              <th>ID</th>
              <th>이메일</th>
              <th>역할</th>
              <th>가입일</th>
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
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="visits"
              stroke="#007bff"
              strokeWidth={3}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>
    </AdminLayout>
  );
}
