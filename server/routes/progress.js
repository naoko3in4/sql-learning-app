const express = require('express');
const router = express.Router();

// インメモリストレージ（実際の実装ではDBを使用）
const userProgress = new Map();
const dailyProgress = new Map();

// ユーザーの進捗情報を取得
router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const today = new Date().toISOString().split('T')[0];
  
  // ユーザーの総進捗を取得
  const totalProgress = userProgress.get(userId) || {
    userId,
    totalProblemsSolved: 0,
    currentScore: 0,
    lastSolvedDate: null,
    problemsSolvedToday: 0
  };
  
  // 今日の進捗を取得
  const todayKey = `${userId}-${today}`;
  const todayProgress = dailyProgress.get(todayKey) || { problemsSolved: 0, score: 0 };
  
  const progress = {
    ...totalProgress,
    problemsSolvedToday: todayProgress.problemsSolved
  };
  
  res.json(progress);
});

// 日次進捗を保存
router.post('/daily', (req, res) => {
  const { userId, date, problemsSolved, score } = req.body;
  
  // 日次進捗を保存
  const todayKey = `${userId}-${date}`;
  dailyProgress.set(todayKey, { problemsSolved, score });
  
  // ユーザーの総進捗を更新
  const currentProgress = userProgress.get(userId) || {
    userId,
    totalProblemsSolved: 0,
    currentScore: 0,
    lastSolvedDate: null,
    problemsSolvedToday: 0
  };
  
  const updatedProgress = {
    ...currentProgress,
    totalProblemsSolved: currentProgress.totalProblemsSolved + problemsSolved,
    currentScore: currentProgress.currentScore + score,
    lastSolvedDate: date,
    problemsSolvedToday: problemsSolved
  };
  
  userProgress.set(userId, updatedProgress);
  
  res.json({ success: true });
});

module.exports = router; 