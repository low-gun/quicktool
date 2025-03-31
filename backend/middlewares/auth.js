// backend/middlewares/auth.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No token provided" });
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    // JWT_SECRET는 .env에 저장
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // 예: decoded 안에 { id, email, role, iat, exp } 등이 들어있다고 가정
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    // next()로 다음 미들웨어/라우트로 진행
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
