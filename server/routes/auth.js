const express = require('express');
const router = express.Router();
const path = require('path');
const Database = require('better-sqlite3');
const dbPath = path.join(__dirname, '../..', 'sample.db');
const db = new Database(dbPath);

// 新規登録
router.post('/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'ユーザー名とパスワードは必須です' });
  const exists = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (exists) return res.status(409).json({ error: 'このユーザー名は既に使われています' });
  const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
  const info = stmt.run(username, password);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(info.lastInsertRowid);
  res.json({ id: user.id, username: user.username, level: user.level });
});

// ログイン
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'ユーザー名とパスワードは必須です' });
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) return res.status(404).json({ error: 'ユーザーが見つかりません' });
  if (user.password !== password) return res.status(401).json({ error: 'パスワードが違います' });
  res.json({ id: user.id, username: user.username, level: user.level });
});

// ユーザー情報取得
router.get('/me/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'ユーザーが見つかりません' });
  res.json({ id: user.id, username: user.username, level: user.level });
});

// レベル更新
router.post('/update-level', (req, res) => {
  const { id, level } = req.body;
  if (!id || level === undefined) return res.status(400).json({ error: 'idとlevelは必須です' });
  db.prepare('UPDATE users SET level = ? WHERE id = ?').run(level, id);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  res.json({ id: user.id, username: user.username, level: user.level });
});

module.exports = router; 