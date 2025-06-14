const Database = require('better-sqlite3');

// データベースファイル（なければ自動作成）
const db = new Database('sample.db');

// テーブル作成
const createTable = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL
);
`;
db.exec(createTable);

// データ挿入
const insert = db.prepare('INSERT INTO users (name) VALUES (?)');
insert.run('Taro');
insert.run('Hanako');

// データ取得
const rows = db.prepare('SELECT * FROM users').all();
console.log('usersテーブルの内容:');
console.log(rows);

db.close(); 