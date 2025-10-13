const express = require('express');
const router = express.Router();
const supabaseDB = require('../db/supabase');

// 新規登録
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'ユーザー名とパスワードは必須です' });
    
    const exists = await supabaseDB.getUserByUsername(username);
    if (exists) return res.status(409).json({ error: 'このユーザー名は既に使われています' });
    
    const user = await supabaseDB.createUser(username, password);
    res.json({ id: user.id, username: user.username, level: user.level });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: '登録に失敗しました' });
  }
});

// ログイン
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'ユーザー名とパスワードは必須です' });
    
    const user = await supabaseDB.getUserByUsername(username);
    if (!user) return res.status(404).json({ error: 'ユーザーが見つかりません' });
    if (user.password !== password) return res.status(401).json({ error: 'パスワードが違います' });
    
    res.json({ id: user.id, username: user.username, level: user.level });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'ログインに失敗しました' });
  }
});

// ユーザー情報取得
router.get('/me/:id', async (req, res) => {
  try {
    const user = await supabaseDB.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'ユーザーが見つかりません' });
    res.json({ id: user.id, username: user.username, level: user.level });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'ユーザー情報の取得に失敗しました' });
  }
});

// レベル更新
router.post('/update-level', async (req, res) => {
  try {
    const { id, level } = req.body;
    if (!id || level === undefined) return res.status(400).json({ error: 'idとlevelは必須です' });
    
    const user = await supabaseDB.updateUserLevel(id, level);
    res.json({ id: user.id, username: user.username, level: user.level });
  } catch (error) {
    console.error('Update level error:', error);
    res.status(500).json({ error: 'レベル更新に失敗しました' });
  }
});

module.exports = router; 