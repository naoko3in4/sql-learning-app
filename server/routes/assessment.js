const express = require('express');
const router = express.Router();
const claudeService = require('../services/claudeService');

// サンプル問題（初級・中級・上級）
const sampleQuestions = [
  // --- 初級 ---
  {
    id: 1,
    text: 'usersテーブルから全てのデータを取得するSQL文はどれ？',
    options: [
      'SELECT * FROM users;',
      'GET ALL FROM users;',
      'FETCH * FROM users;',
      'SHOW ALL users;'
    ],
    correctAnswer: 0
  },
  {
    id: 2,
    text: 'ageカラムが20以上のデータだけを取得するWHERE句の条件は？',
    options: [
      'WHERE age >= 20',
      'WHERE age => 20',
      'WHERE age > 20',
      'WHERE age =< 20'
    ],
    correctAnswer: 0
  },
  // --- 中級 ---
  {
    id: 3,
    text: '2つのテーブルを結合してデータを取得するSQLの構文はどれ？',
    options: [
      'SELECT * FROM A INNER JOIN B ON A.id = B.a_id;',
      'SELECT * FROM A JOIN B;',
      'SELECT * FROM A, B;',
      'SELECT * FROM A CONNECT B;'
    ],
    correctAnswer: 0
  },
  {
    id: 4,
    text: '売上テーブル(sales)から日付ごとの合計金額を求めるSQLはどれ？',
    options: [
      'SELECT date, SUM(amount) FROM sales GROUP BY date;',
      'SELECT date, SUM(amount) FROM sales;',
      'SELECT SUM(amount) FROM sales GROUP BY date;',
      'SELECT date, amount FROM sales GROUP BY date;'
    ],
    correctAnswer: 0
  },
  // --- 上級 ---
  {
    id: 5,
    text: '社員テーブルで部門ごとに給与の平均を求め、平均が30万円以上の部門だけを抽出するSQLは？',
    options: [
      'SELECT department, AVG(salary) FROM employees GROUP BY department HAVING AVG(salary) >= 300000;',
      'SELECT department, AVG(salary) FROM employees WHERE AVG(salary) >= 300000 GROUP BY department;',
      'SELECT department, AVG(salary) FROM employees GROUP BY department WHERE AVG(salary) >= 300000;',
      'SELECT department, AVG(salary) FROM employees HAVING AVG(salary) >= 300000 GROUP BY department;'
    ],
    correctAnswer: 0
  },
  {
    id: 6,
    text: '再帰クエリ（階層データの取得）に使うSQLの構文はどれ？',
    options: [
      'WITH RECURSIVE',
      'RECURSIVE SELECT',
      'SELECT RECURSIVE',
      'RECURSIVE WITH'
    ],
    correctAnswer: 0
  }
];

// 理解度テストの問題取得
router.get('/questions', (req, res) => {
  res.json(sampleQuestions);
});

// ユーザーの回答を受け取り、正誤判定してスコアを返す
router.post('/submit', (req, res) => {
  const { answers } = req.body; // 例: [0, 2, ...]
  let score = 0;
  answers.forEach((ans, idx) => {
    if (sampleQuestions[idx] && ans === sampleQuestions[idx].correctAnswer) {
      score++;
    }
  });
  res.json({
    score,
    total: sampleQuestions.length,
    message: `あなたのスコアは${score}点です` 
  });
});

// 理解度テストの生成
router.post('/generate', async (req, res) => {
  try {
    const { level } = req.body;
    const assessment = await claudeService.generateAssessment(level);
    res.json(assessment);
  } catch (error) {
    console.error('Assessment generation failed:', error);
    res.status(500).json({ error: '理解度テストの生成に失敗しました' });
  }
});

module.exports = router; 