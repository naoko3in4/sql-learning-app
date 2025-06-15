const Database = require('better-sqlite3');
const db = new Database('sample.db');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT,
  level INTEGER DEFAULT NULL
);
`);

console.log('usersテーブルを作成しました');
db.close(); 