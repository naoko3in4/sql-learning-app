const express = require('express');
const router = express.Router();
const path = require('path');
const Database = require('better-sqlite3');
const dbPath = path.join(__dirname, '../..', 'sample.db');
const db = new Database(dbPath);

// ユーザーの進捗情報を取得
router.get('/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const today = new Date().toISOString().split('T')[0];
    
    // ユーザーの総進捗を取得
    const totalProgress = db.prepare('SELECT * FROM user_progress WHERE user_id = ?').get(userId);
    
    // 今日の回答数を取得
    const today_string = new Date().toISOString().slice(0, 10);
    const todayProgress = db.prepare(`
      SELECT COUNT(*) as count 
      FROM user_answers 
      WHERE user_id = ? AND date(answered_at) = ?
    `).get(userId, today_string);

    const progress = {
      userId,
      totalProblemsAnswered: totalProgress ? totalProgress.total_problems_answered : 0,
      totalProblemsCorrect: totalProgress ? totalProgress.total_problems_correct : 0,
      currentScore: totalProgress ? totalProgress.current_score : 0,
      lastSolvedDate: totalProgress ? totalProgress.last_solved_date : null,
      problemsAnsweredToday: todayProgress ? todayProgress.count : 0
    };
    
    res.json(progress);
  } catch (error) {
    console.error('進捗取得エラー:', error);
    res.status(500).json({ error: '進捗の取得に失敗しました' });
  }
});



// ユーザーの学習統計を取得
router.get('/stats/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    // 総合統計
    const totalStats = db.prepare(`
      SELECT 
        COUNT(*) as total_answers,
        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_answers,
        SUM(score) as total_score,
        AVG(CASE WHEN is_correct = 1 THEN 1.0 ELSE 0.0 END) * 100 as accuracy_rate
      FROM user_answers 
      WHERE user_id = ?
    `).get(userId);
    
    // レベル別統計
    const levelStats = db.prepare(`
      SELECT 
        p.level,
        COUNT(*) as total_answers,
        SUM(CASE WHEN ua.is_correct = 1 THEN 1 ELSE 0 END) as correct_answers,
        AVG(CASE WHEN ua.is_correct = 1 THEN 1.0 ELSE 0.0 END) * 100 as accuracy_rate
      FROM user_answers ua
      JOIN problems p ON ua.problem_id = p.id
      WHERE ua.user_id = ?
      GROUP BY p.level
      ORDER BY p.level
    `).all(userId);
    
    // 日別統計（過去30日）
    const dailyStats = db.prepare(`
      SELECT 
        date,
        problems_solved,
        score
      FROM daily_progress 
      WHERE user_id = ? 
      ORDER BY date DESC 
      LIMIT 30
    `).all(userId);
    
    res.json({
      totalStats,
      levelStats,
      dailyStats
    });
  } catch (error) {
    console.error('統計取得エラー:', error);
    res.status(500).json({ error: '統計の取得に失敗しました' });
  }
});

module.exports = router; 