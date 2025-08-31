const express = require('express');
const router = express.Router();
const path = require('path');
const Database = require('better-sqlite3');
const dbPath = path.join(__dirname, '../..', 'sample.db');
const db = new Database(dbPath);

// ダッシュボードの統計情報を取得
router.get('/stats/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    // ユーザーの進捗情報を取得
    const progress = db.prepare('SELECT * FROM user_progress WHERE user_id = ?').get(userId);
    
    // 本日の進捗を取得
    const today = new Date().toISOString().split('T')[0];
    const todayProgress = db.prepare('SELECT * FROM daily_progress WHERE user_id = ? AND date = ?').get(userId, today);
    
    // 正解率を計算
    const totalAnswered = progress ? progress.total_problems_answered : 0;
    const totalCorrect = progress ? progress.total_problems_correct : 0;
    const accuracyRate = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
    
    // レベル別の解答数を取得
    const levelStats = db.prepare(`
      SELECT 
        p.level,
        COUNT(*) as total_answered,
        SUM(CASE WHEN ua.is_correct = 1 THEN 1 ELSE 0 END) as total_correct
      FROM user_answers ua
      JOIN problems p ON ua.problem_id = p.id
      WHERE ua.user_id = ?
      GROUP BY p.level
      ORDER BY p.level
    `).all(userId);
    
    const stats = {
      totalProblemsAnswered: totalAnswered,
      totalProblemsCorrect: totalCorrect,
      accuracyRate: accuracyRate,
      currentScore: progress ? progress.current_score : 0,
      lastSolvedDate: progress ? progress.last_solved_date : null,
      todayProblemsSolved: todayProgress ? todayProgress.problems_solved : 0,
      todayScore: todayProgress ? todayProgress.score : 0,
      levelStats: levelStats.map(stat => ({
        level: stat.level,
        totalAnswered: stat.total_answered,
        totalCorrect: stat.total_correct,
        accuracyRate: stat.total_answered > 0 ? Math.round((stat.total_correct / stat.total_answered) * 100) : 0
      }))
    };
    
    res.json(stats);
  } catch (error) {
    console.error('統計情報取得エラー:', error);
    res.status(500).json({ error: '統計情報の取得に失敗しました' });
  }
});

// 詳細な解答履歴を取得（ページネーション対応）
router.get('/history/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, level } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    
    let query = `
      SELECT 
        ua.*,
        p.title as problem_title,
        p.description as problem_description,
        p.table_structure,
        p.sample_data,
        p.expected_result,
        p.level as problem_level
      FROM user_answers ua
      JOIN problems p ON ua.problem_id = p.id
      WHERE ua.user_id = ?
    `;
    
    let params = [userId];
    
    if (level) {
      query += ' AND p.level = ?';
      params.push(parseInt(level));
    }
    
    query += ' ORDER BY ua.answered_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), offset);
    
    const answers = db.prepare(query).all(...params);
    
    // 総件数を取得
    let countQuery = `
      SELECT COUNT(*) as total
      FROM user_answers ua
      JOIN problems p ON ua.problem_id = p.id
      WHERE ua.user_id = ?
    `;
    
    let countParams = [userId];
    
    if (level) {
      countQuery += ' AND p.level = ?';
      countParams.push(parseInt(level));
    }
    
    const totalCount = db.prepare(countQuery).get(...countParams).total;
    
    const formattedAnswers = answers.map(answer => ({
      id: answer.id,
      problemId: answer.problem_id,
      problemTitle: answer.problem_title,
      problemDescription: answer.problem_description,
      tableStructure: answer.table_structure,
      sampleData: answer.sample_data,
      expectedResult: answer.expected_result,
      problemLevel: answer.problem_level,
      userSQL: answer.user_sql,
      isCorrect: answer.is_correct === 1,
      feedback: {
        syntaxCheck: answer.feedback_syntax_check,
        suggestions: JSON.parse(answer.feedback_suggestions || '[]'),
        improvedSQL: answer.feedback_improved_sql,
        changes: JSON.parse(answer.feedback_changes || '[]'),
        learningPoints: JSON.parse(answer.feedback_learning_points || '[]')
      },
      score: answer.score,
      answeredAt: answer.answered_at
    }));
    
    res.json({
      answers: formattedAnswers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount: totalCount,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('解答履歴取得エラー:', error);
    res.status(500).json({ error: '解答履歴の取得に失敗しました' });
  }
});

// 最近の解答履歴（最新10件）
router.get('/recent/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    
    const recentAnswers = db.prepare(`
      SELECT 
        ua.*,
        p.title as problem_title,
        p.level as problem_level
      FROM user_answers ua
      JOIN problems p ON ua.problem_id = p.id
      WHERE ua.user_id = ?
      ORDER BY ua.answered_at DESC
      LIMIT 10
    `).all(userId);
    
    const formattedAnswers = recentAnswers.map(answer => ({
      id: answer.id,
      problemTitle: answer.problem_title,
      problemLevel: answer.problem_level,
      userSQL: answer.user_sql,
      isCorrect: answer.is_correct === 1,
      score: answer.score,
      answeredAt: answer.answered_at
    }));
    
    res.json(formattedAnswers);
  } catch (error) {
    console.error('最近の解答履歴取得エラー:', error);
    res.status(500).json({ error: '最近の解答履歴の取得に失敗しました' });
  }
});

module.exports = router;
