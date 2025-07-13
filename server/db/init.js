const Database = require('better-sqlite3');
const db = new Database('sample.db');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT,
  level INTEGER DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS problems (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  table_structure TEXT NOT NULL,
  sample_data TEXT NOT NULL,
  expected_result TEXT NOT NULL,
  hints TEXT NOT NULL,
  level INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_answers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  problem_id INTEGER NOT NULL,
  user_sql TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  feedback_syntax_check TEXT,
  feedback_suggestions TEXT,
  feedback_improved_sql TEXT,
  feedback_changes TEXT,
  feedback_learning_points TEXT,
  score INTEGER DEFAULT 0,
  answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (problem_id) REFERENCES problems(id)
);

CREATE TABLE IF NOT EXISTS user_progress (
  user_id INTEGER PRIMARY KEY,
  total_problems_answered INTEGER DEFAULT 0,
  total_problems_correct INTEGER DEFAULT 0,
  current_score INTEGER DEFAULT 0,
  last_solved_date TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS daily_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  date TEXT NOT NULL,
  problems_solved INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
`);

console.log('データベーステーブルを作成しました');
db.close(); 