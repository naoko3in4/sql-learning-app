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
    correctAnswer: 0,
    explanation: 'SQLで全件取得はSELECT * FROM テーブル名; です。他の選択肢はSQLの構文ではありません。'
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
    correctAnswer: 0,
    explanation: '>= は「以上」を表します。=> や =< はSQLの演算子として正しくありません。'
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
    correctAnswer: 0,
    explanation: 'INNER JOINを使い、ONで結合条件を指定します。他の選択肢は正しいSQL構文ではありません。'
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
    correctAnswer: 0,
    explanation: 'GROUP BYで日付ごとに集計し、SUM関数で合計金額を求めます。GROUP BYがないと日付ごとの集計になりません。'
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
    correctAnswer: 0,
    explanation: 'HAVING句はGROUP BYで集計した後の条件指定に使います。WHEREでAVG関数は使えません。'
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
    correctAnswer: 0,
    explanation: '再帰クエリはWITH RECURSIVEで始めます。他の選択肢は正しい構文ではありません。'
  }
];

// 理解度テストの問題取得
router.get('/questions', (req, res) => {
  res.json(sampleQuestions);
});

// ユーザーの回答を受け取り、正誤判定してスコア・レベル・詳細を返す
router.post('/submit', (req, res) => {
  const { answers } = req.body; // 例: [0, 2, ...]
  let score = 0;
  let beginner = 0, intermediate = 0, advanced = 0;
  const details = [];

  answers.forEach((ans, idx) => {
    const q = sampleQuestions[idx];
    if (!q) return;
    const isCorrect = ans === q.correctAnswer;
    if (isCorrect) {
      score++;
      if (idx < 2) beginner++;
      else if (idx < 4) intermediate++;
      else advanced++;
    }
    details.push({
      question: q.text,
      userAnswer: ans,
      isCorrect,
      correctAnswer: q.correctAnswer,
      correctAnswerText: q.options[q.correctAnswer],
      explanation: q.explanation
    });
  });

  // レベル判定（数値＋ラベル）
  let level = 0;
  let levelLabel = '';
  if (score === 0) {
    level = 1;
    levelLabel = '初級';
  } else if (advanced === 2) {
    level = 3;
    levelLabel = '上級';
  } else if (intermediate === 2) {
    level = 2;
    levelLabel = '中級';
  } else if (beginner >= 1) {
    level = 1;
    levelLabel = '初級';
  } else {
    level = 0;
    levelLabel = '未判定';
  }

  res.json({
    score,
    total: sampleQuestions.length,
    level,
    levelLabel,
    message: `あなたのスコアは${score}点です。あなたは${levelLabel}レベルです。`,
    details
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