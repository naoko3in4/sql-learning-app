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

module.exports = router; 