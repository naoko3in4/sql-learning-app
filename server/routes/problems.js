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

// サンプル問題（レベルごとに出し分け可能）
const sampleProblems = [
  {
    level: 1,
    title: '初級問題',
    description: 'usersテーブルから全件取得するSQLを書いてください。',
    tableStructure: 'users(id INTEGER, name TEXT, age INTEGER)',
    sampleData: '1, Taro, 20\n2, Hanako, 22',
    expectedResult: 'id,name,age\n1,Taro,20\n2,Hanako,22',
    hints: ['SELECT文の基本形を思い出しましょう', '全カラム取得は*を使います'],
  },
  {
    level: 2,
    title: '中級問題',
    description: 'ordersテーブルとusersテーブルを結合して、各ユーザーの注文数を求めるSQLを書いてください。',
    tableStructure: 'users(id INTEGER, name TEXT), orders(id INTEGER, user_id INTEGER, item TEXT)',
    sampleData: 'users: 1,Taro\n2,Hanako\norders: 1,1,Book\n2,1,Pen\n3,2,Note',
    expectedResult: 'name,order_count\nTaro,2\nHanako,1',
    hints: ['JOINを使いましょう', 'GROUP BYで集計します'],
  },
  {
    level: 3,
    title: '上級問題',
    description: 'salesテーブルから月ごとの売上合計を求めるウィンドウ関数を使ったSQLを書いてください。',
    tableStructure: 'sales(id INTEGER, amount INTEGER, sale_date TEXT)',
    sampleData: '1, 1000, 2024-06-01\n2, 2000, 2024-06-15\n3, 1500, 2024-07-01',
    expectedResult: 'sale_month,total_amount\n2024-06,3000\n2024-07,1500',
    hints: ['strftimeで月を抽出', 'SUM() OVER(PARTITION BY ...)を使う'],
  },
];

router.get('/generate', (req, res) => {
  const level = parseInt(req.query.level || '1');
  const problem = sampleProblems.find(p => p.level === level) || sampleProblems[0];
  res.json(problem);
});

module.exports = router; 