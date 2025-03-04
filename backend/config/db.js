const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: "localhost",
  user: process.env.DATABASE_URL.split(":")[1].replace("//", ""),
  password: process.env.DATABASE_URL.split(":")[2].split("@")[0],
  database: process.env.DATABASE_URL.split("/")[3],
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

module.exports = pool;
