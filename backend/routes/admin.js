const express = require("express");
const router = express.Router();
const isAdmin = require("../middlewares/isAdmin");
const db = require("../config/db");

// 관리자 전용 테스트 라우트 (접근권한 확인용)
router.get("/test", isAdmin, (req, res) => {
  res.json({ message: `관리자 접근 성공! 환영합니다, ${req.user.email}` });
});

// 관리자 대시보드 데이터 제공 API
router.get("/dashboard", isAdmin, async (req, res) => {
  try {
    // 총 회원 수
    const [userCountResult] = await db.query(
      "SELECT COUNT(*) AS totalUsers FROM users"
    );

    // 오늘 방문자 수
    const [todayVisitResult] = await db.query(
      "SELECT COUNT(*) AS todayVisits FROM visit_logs WHERE DATE(visited_at) = CURDATE()"
    );

    res.json({
      totalUsers: userCountResult[0].totalUsers,
      todayVisits: todayVisitResult[0].todayVisits,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 사용자 목록 가져오기 API
router.get("/users", isAdmin, async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, email, role, created_at, updated_at, visit_count FROM users ORDER BY created_at DESC"
    );
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 방문자 통계 API (최근 30일)
router.get("/stats/visits", isAdmin, async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        DATE(visited_at) AS date,
        COUNT(*) AS visits
      FROM visit_logs
      WHERE visited_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(visited_at)
      ORDER BY date ASC
    `);
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류가 발생했습니다." });
  }
});

// 특정 사용자를 관리자로 지정 (관리자 전용)
router.put("/users/:id/make-admin", isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("UPDATE users SET role = 'admin' WHERE id = ?", [id]);
    res.json({ message: "해당 사용자를 관리자로 지정했습니다." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "권한 변경 중 오류가 발생했습니다." });
  }
});

// 특정 관리자의 권한을 일반 유저로 변경 (관리자 전용)
router.put("/users/:id/remove-admin", isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("UPDATE users SET role = 'user' WHERE id = ?", [id]);
    res.json({ message: "해당 사용자의 관리 권한을 해제했습니다." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "권한 변경 중 오류가 발생했습니다." });
  }
});

// 특정 사용자 삭제 (관리자 전용)
router.delete("/users/:id", isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query("DELETE FROM visit_logs WHERE user_id = ?", [id]);
    await db.query("DELETE FROM users WHERE id = ?", [id]);
    res.json({ message: "사용자가 삭제되었습니다." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "사용자 삭제 중 오류가 발생했습니다." });
  }
});

module.exports = router;
