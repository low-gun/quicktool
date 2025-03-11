const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "2313",
  database: "quicktool_database", // 방금 만든 DB명
});

module.exports = pool.promise();
