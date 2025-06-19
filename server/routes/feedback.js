const express = require('express');
const router = express.Router();
const claudeService = require('../services/claudeService');

// SQLクエリの添削・解説
router.post('/analyze', async (req, res) => {
  try {
    const { userSQL, expectedResult, userLevel } = req.body;
    const feedback = await claudeService.provideFeedback(userSQL, expectedResult, userLevel);
    res.json(feedback);
  } catch (error) {
    console.error('Feedback generation failed:', error);
    res.status(500).json({ error: 'フィードバックの生成に失敗しました' });
  }
});

// サンプルフィードバック
const sampleFeedback = {
  syntaxCheck: 'SQL文の構文は正しいです。',
  suggestions: ['特に改善点はありませんが、AS句でカラム名を明示するとより親切です。'],
  improvedSQL: 'SELECT COUNT(o.item) AS order_count FROM users AS u INNER JOIN orders AS o ON u.id = o.user_id GROUP BY name;'
};

router.post('/', async (req, res) => {
  try {
    if (process.env.USE_SAMPLE_FEEDBACK === 'true') {
      return res.json(sampleFeedback);
    }
    const { sql, expectedResult } = req.body;
    const userLevel = req.body.userLevel || 'beginner';
    const feedback = await claudeService.provideFeedback(sql, expectedResult, userLevel);
    res.json(feedback);
  } catch (error) {
    console.error('Feedback取得失敗:', error);
    if (error.response) {
      console.error('Claude response:', error.response.data);
    }
    res.status(500).json({ error: 'フィードバックの取得に失敗しました', details: error.message });
  }
});

module.exports = router; 