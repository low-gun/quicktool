// backend/routes/notes.js

const express = require("express");
const router = express.Router();
const pool = require("../config/db"); // DB 연결
const authMiddleware = require("../middlewares/auth"); // 인증 미들웨어

// GET /api/notes
// 로그인한 사용자의 모든 메모(1개 이상) 불러오기
router.get("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id; // authMiddleware 에서 req.user 에 { id, email } 등 주입
    // DB에서 SELECT
    const [rows] = await pool.query(
      "SELECT id, note, updated_at FROM notes WHERE user_id = ?",
      [userId]
    );
    // rows: [{ id:1, note:'...', updated_at:'...' }, ...]
    return res.json({ notes: rows });
  } catch (err) {
    console.error("GET /api/notes error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// POST /api/notes
// 새 메모 추가 (또는 특정 로직으로 업데이트) - 여기선 새 레코드 insert 예시
router.post("/", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const { note } = req.body; // 클라이언트가 { note: "..." } 로 보냄

    // 메모 새 레코드 저장
    const [result] = await pool.query(
      "INSERT INTO notes (user_id, note) VALUES (?, ?)",
      [userId, note]
    );

    // result.insertId 에 새로운 note id
    return res.json({
      message: "Note saved",
      noteId: result.insertId,
    });
  } catch (err) {
    console.error("POST /api/notes error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// PUT /api/notes/:id - 특정 메모 수정 (선택)
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;
    const { note } = req.body;

    // user_id 가 일치하는 noteId 만 수정 가능
    const [result] = await pool.query(
      "UPDATE notes SET note=? WHERE id=? AND user_id=?",
      [note, noteId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Not found or no permission" });
    }

    return res.json({ message: "Note updated" });
  } catch (err) {
    console.error("PUT /api/notes/:id error:", err);
    return res.status(500).json({ error: err.message });
  }
});

// DELETE /api/notes/:id - 특정 메모 삭제 (선택)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const noteId = req.params.id;

    const [result] = await pool.query(
      "DELETE FROM notes WHERE id=? AND user_id=?",
      [noteId, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Not found or no permission" });
    }

    return res.json({ message: "Note deleted" });
  } catch (err) {
    console.error("DELETE /api/notes/:id error:", err);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
