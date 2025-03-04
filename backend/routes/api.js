const express = require("express");
const router = express.Router();

// 테스트용 기본 API 엔드포인트
router.get("/test", (req, res) => {
  res.json({ message: "✅ API 정상 작동 중" });
});

module.exports = router;
