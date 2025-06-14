const express = require('express');
const router = express.Router();
const claudeService = require('../services/claudeService');

// 問題の生成
router.post('/generate', async (req, res) => {
  try {
    const { userLevel, topic } = req.body;
    const problem = await claudeService.generateProblem(userLevel, topic);
    res.json(problem);
  } catch (error) {
    console.error('Problem generation failed:', error);
    res.status(500).json({ error: '問題の生成に失敗しました' });
  }
});

module.exports = router; 