const express = require('express');
const router = express.Router();
const claudeService = require('../services/claudeService');
const path = require('path');
const Database = require('better-sqlite3');
const dbPath = path.join(__dirname, '../..', 'sample.db');
const db = new Database(dbPath);
const sampleFeedback = require('../data/sampleFeedback');

// 環境変数の確認
const USE_SAMPLE_FEEDBACK = process.env.USE_SAMPLE_FEEDBACK === 'true';

// SQLクエリの添削・解説
router.post('/analyze', async (req, res) => {
  try {
    const { userSQL, expectedResult, userLevel, problemId, userId } = req.body;
    
    let feedback;
    if (USE_SAMPLE_FEEDBACK) {
      // サンプルフィードバックを使用
      console.log('サンプルフィードバックを使用します');
      feedback = getSampleFeedback(userSQL);
    } else {
      // Claude APIを使用
      console.log('Claude APIを使用します');
      feedback = await claudeService.provideFeedback(userSQL, expectedResult, userLevel);
    }
    
    // ユーザーの回答をDBに保存
    if (userId && problemId) {
      saveUserAnswer(userId, problemId, userSQL, feedback, expectedResult);
    }
    
    res.json(feedback);
  } catch (error) {
    console.error('Feedback generation failed:', error);
    res.status(500).json({ error: 'フィードバックの生成に失敗しました' });
  }
});

// サンプルフィードバックを取得
const getSampleFeedback = (userSQL) => {
  // ユーザーのSQLに基づいて適切なサンプルフィードバックを返す
  const normalizedSQL = userSQL.trim().toUpperCase();
  
  // 特定のSQLパターンにマッチするフィードバックを探す
  for (const [pattern, feedback] of Object.entries(sampleFeedback)) {
    if (pattern === 'default') continue;
    
    const normalizedPattern = pattern.trim().toUpperCase();
    if (normalizedSQL.includes(normalizedPattern) || normalizedPattern.includes(normalizedSQL)) {
      return feedback;
    }
  }
  
  // マッチするものがない場合はデフォルトフィードバックを返す
  return sampleFeedback.default;
};

// ユーザーの回答をDBに保存
const saveUserAnswer = (userId, problemId, userSQL, feedback, expectedResult) => {
  try {
    const isCorrect = checkAnswer(userSQL, expectedResult);
    const score = isCorrect ? 1 : 0; // 正解なら1点、不正解なら0点
    const date = new Date().toISOString().split('T')[0];

    const transaction = db.transaction(() => {
      // 1. user_answers に回答を保存
      const stmt = db.prepare(`
        INSERT INTO user_answers (
          user_id, problem_id, user_sql, is_correct,
          feedback_syntax_check, feedback_suggestions, feedback_improved_sql,
          feedback_changes, feedback_learning_points, score
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      const info = stmt.run(
        userId, problemId, userSQL, isCorrect ? 1 : 0,
        feedback.syntaxCheck, JSON.stringify(feedback.suggestions),
        feedback.improvedSQL, JSON.stringify(feedback.changes),
        JSON.stringify(feedback.learningPoints), score
      );
      console.log('ユーザー回答を保存しました:', info.lastInsertRowid);

      // 2. user_progress を更新
      let progress = db.prepare('SELECT * FROM user_progress WHERE user_id = ?').get(userId);
      if (!progress) {
        db.prepare('INSERT INTO user_progress (user_id, total_problems_answered, total_problems_correct, current_score, last_solved_date) VALUES (?, 0, 0, 0, NULL)').run(userId);
      }

      const progressUpdateStmt = db.prepare(`
        UPDATE user_progress
        SET total_problems_answered = total_problems_answered + 1,
            total_problems_correct = total_problems_correct + ?,
            current_score = current_score + ?,
            last_solved_date = ?
        WHERE user_id = ?
      `);
      progressUpdateStmt.run(isCorrect ? 1 : 0, score, date, userId);

      // 3. daily_progress を更新
      let dailyProgress = db.prepare('SELECT * FROM daily_progress WHERE user_id = ? AND date = ?').get(userId, date);
      if (!dailyProgress) {
        db.prepare('INSERT INTO daily_progress (user_id, date, problems_solved, score) VALUES (?, ?, 0, 0)').run(userId, date);
      }
      const dailyUpdateStmt = db.prepare(`
        UPDATE daily_progress
        SET problems_solved = problems_solved + ?,
            score = score + ?
        WHERE user_id = ? AND date = ?
      `);
      dailyUpdateStmt.run(isCorrect ? 1 : 0, score, userId, date);
    });

    transaction();

  } catch (error) {
    console.error('ユーザー回答の保存に失敗:', error);
  }
};

// 簡易的な正解判定（実際の実装ではより厳密な判定が必要）
const checkAnswer = (userSQL, expectedResult) => {
  // ここでは簡易的に、ユーザーのSQLが空でないことをチェック
  // 実際の実装では、SQLの実行結果と期待される結果を比較する必要がある
  return userSQL.trim().length > 0;
};



router.post('/', async (req, res) => {
  try {
    const { sql, expectedResult, problemId, userId } = req.body;
    const userLevel = req.body.userLevel || 'beginner';
    
    let feedback;
    if (USE_SAMPLE_FEEDBACK) {
      // サンプルフィードバックを使用
      console.log('サンプルフィードバックを使用します');
      feedback = getSampleFeedback(sql);
    } else {
      // Claude APIを使用
      console.log('Claude APIを使用します');
      feedback = await claudeService.provideFeedback(sql, expectedResult, userLevel);
    }
    
    // ユーザーの回答をDBに保存
    if (userId && problemId) {
      saveUserAnswer(userId, problemId, sql, feedback, expectedResult);
    }
    
    res.json(feedback);
  } catch (error) {
    console.error('Feedback取得失敗:', error);
    if (error.response) {
      console.error('Claude response:', error.response.data);
    }
    res.status(500).json({ error: 'フィードバックの取得に失敗しました', details: error.message });
  }
});

// ユーザーの回答履歴を取得
router.get('/history/:userId', (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 10, offset = 0 } = req.query;
    
    const answers = db.prepare(`
      SELECT 
        ua.*,
        p.title as problem_title,
        p.level as problem_level
      FROM user_answers ua
      JOIN problems p ON ua.problem_id = p.id
      WHERE ua.user_id = ?
      ORDER BY ua.answered_at DESC
      LIMIT ? OFFSET ?
    `).all(userId, parseInt(limit), parseInt(offset));
    
    const formattedAnswers = answers.map(answer => ({
      id: answer.id,
      problemId: answer.problem_id,
      problemTitle: answer.problem_title,
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
    
    res.json(formattedAnswers);
  } catch (error) {
    console.error('回答履歴取得エラー:', error);
    res.status(500).json({ error: '回答履歴の取得に失敗しました' });
  }
});

module.exports = router; 