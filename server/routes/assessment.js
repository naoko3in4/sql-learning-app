const express = require('express');
const router = express.Router();
const claudeService = require('../services/claudeService');

// サンプル問題（初級・中級・上級）
const sampleQuestions = [
  // --- 初級（5問） ---
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
    explanation: 'SQLで全件取得はSELECT * FROM テーブル名; です。他の選択肢はSQLの構文ではありません。',
    level: 1
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
    explanation: '>= は「以上」を表します。=> や =< はSQLの演算子として正しくありません。',
    level: 1
  },
  {
    id: 3,
    text: 'データを昇順で並び替えるORDER BY句の正しい使い方は？',
    options: [
      'ORDER BY column_name ASC',
      'ORDER BY column_name UP',
      'ORDER BY column_name HIGH',
      'ORDER BY column_name INCREASE'
    ],
    correctAnswer: 0,
    explanation: '昇順はASC（省略可能）、降順はDESCを使用します。',
    level: 1
  },
  {
    id: 4,
    text: '特定の列だけを取得するSELECT文の正しい書き方は？',
    options: [
      'SELECT name, age FROM users;',
      'SELECT (name, age) FROM users;',
      'SELECT name AND age FROM users;',
      'SELECT name + age FROM users;'
    ],
    correctAnswer: 0,
    explanation: '複数の列を取得する場合は、カンマで区切って指定します。',
    level: 1
  },
  {
    id: 5,
    text: 'データを挿入するSQL文はどれ？',
    options: [
      'INSERT INTO users (name, age) VALUES ("田中", 25);',
      'ADD INTO users (name, age) VALUES ("田中", 25);',
      'CREATE INTO users (name, age) VALUES ("田中", 25);',
      'PUT INTO users (name, age) VALUES ("田中", 25);'
    ],
    correctAnswer: 0,
    explanation: 'データの挿入はINSERT INTO文を使用します。',
    level: 1
  },
  // --- 中級（5問） ---
  {
    id: 6,
    text: '2つのテーブルを結合してデータを取得するSQLの構文はどれ？',
    options: [
      'SELECT * FROM A INNER JOIN B ON A.id = B.a_id;',
      'SELECT * FROM A JOIN B;',
      'SELECT * FROM A, B;',
      'SELECT * FROM A CONNECT B;'
    ],
    correctAnswer: 0,
    explanation: 'INNER JOINを使い、ONで結合条件を指定します。他の選択肢は正しいSQL構文ではありません。',
    level: 2
  },
  {
    id: 7,
    text: '売上テーブル(sales)から日付ごとの合計金額を求めるSQLはどれ？',
    options: [
      'SELECT date, SUM(amount) FROM sales GROUP BY date;',
      'SELECT date, SUM(amount) FROM sales;',
      'SELECT SUM(amount) FROM sales GROUP BY date;',
      'SELECT date, amount FROM sales GROUP BY date;'
    ],
    correctAnswer: 0,
    explanation: 'GROUP BYで日付ごとに集計し、SUM関数で合計金額を求めます。GROUP BYがないと日付ごとの集計になりません。',
    level: 2
  },
  {
    id: 8,
    text: 'LEFT JOINとINNER JOINの違いは？',
    options: [
      'LEFT JOINは左テーブルの全レコードを保持し、INNER JOINは両方のテーブルに存在するレコードのみ',
      'LEFT JOINは右テーブルの全レコードを保持し、INNER JOINは左テーブルの全レコードを保持',
      'LEFT JOINとINNER JOINは同じ動作をする',
      'LEFT JOINは結合条件が不要で、INNER JOINは結合条件が必要'
    ],
    correctAnswer: 0,
    explanation: 'LEFT JOINは左テーブルの全レコードを保持し、右テーブルにマッチしない場合はNULLを返します。INNER JOINは両方のテーブルに存在するレコードのみを返します。',
    level: 2
  },
  {
    id: 9,
    text: 'サブクエリを使用して、平均給与より高い給与の従業員を取得するSQLは？',
    options: [
      'SELECT * FROM employees WHERE salary > (SELECT AVG(salary) FROM employees);',
      'SELECT * FROM employees WHERE salary > AVG(salary);',
      'SELECT * FROM employees WHERE salary > (SELECT salary FROM employees WHERE salary = AVG(salary));',
      'SELECT * FROM employees WHERE salary > (SELECT MAX(salary) FROM employees);'
    ],
    correctAnswer: 0,
    explanation: 'サブクエリで平均給与を計算し、それをWHERE句の条件として使用します。',
    level: 2
  },
  {
    id: 10,
    text: 'CASE文を使用して給与をランク分けするSQLは？',
    options: [
      'SELECT name, CASE WHEN salary >= 500000 THEN "高" WHEN salary >= 300000 THEN "中" ELSE "低" END FROM employees;',
      'SELECT name, IF salary >= 500000 THEN "高" ELSE "低" END FROM employees;',
      'SELECT name, WHEN salary >= 500000 THEN "高" FROM employees;',
      'SELECT name, salary >= 500000 ? "高" : "低" FROM employees;'
    ],
    correctAnswer: 0,
    explanation: 'CASE文は条件分岐を行うSQLの構文です。WHEN-THEN-ELSEの形式で記述します。',
    level: 2
  },
  // --- 上級（5問） ---
  {
    id: 11,
    text: '社員テーブルで部門ごとに給与の平均を求め、平均が30万円以上の部門だけを抽出するSQLは？',
    options: [
      'SELECT department, AVG(salary) FROM employees GROUP BY department HAVING AVG(salary) >= 300000;',
      'SELECT department, AVG(salary) FROM employees WHERE AVG(salary) >= 300000 GROUP BY department;',
      'SELECT department, AVG(salary) FROM employees GROUP BY department WHERE AVG(salary) >= 300000;',
      'SELECT department, AVG(salary) FROM employees HAVING AVG(salary) >= 300000 GROUP BY department;'
    ],
    correctAnswer: 0,
    explanation: 'HAVING句はGROUP BYで集計した後の条件指定に使います。WHEREでAVG関数は使えません。',
    level: 3
  },
  {
    id: 12,
    text: '再帰クエリ（階層データの取得）に使うSQLの構文はどれ？',
    options: [
      'WITH RECURSIVE',
      'RECURSIVE SELECT',
      'SELECT RECURSIVE',
      'RECURSIVE WITH'
    ],
    correctAnswer: 0,
    explanation: '再帰クエリはWITH RECURSIVEで始めます。他の選択肢は正しい構文ではありません。',
    level: 3
  },
  {
    id: 13,
    text: 'ウィンドウ関数を使用して、各部門内での給与ランキングを求めるSQLは？',
    options: [
      'SELECT name, salary, RANK() OVER (PARTITION BY department ORDER BY salary DESC) FROM employees;',
      'SELECT name, salary, RANK() OVER (ORDER BY salary DESC) FROM employees;',
      'SELECT name, salary, RANK() PARTITION BY department ORDER BY salary DESC FROM employees;',
      'SELECT name, salary, RANK() GROUP BY department ORDER BY salary DESC FROM employees;'
    ],
    correctAnswer: 0,
    explanation: 'ウィンドウ関数はOVER句を使用し、PARTITION BYでグループ化、ORDER BYでソート順を指定します。',
    level: 3
  },
  {
    id: 14,
    text: 'CTE（Common Table Expression）の正しい構文は？',
    options: [
      'WITH temp AS (SELECT * FROM users) SELECT * FROM temp;',
      'CREATE temp AS (SELECT * FROM users) SELECT * FROM temp;',
      'SELECT * FROM (WITH temp AS (SELECT * FROM users)) temp;',
      'DEFINE temp AS (SELECT * FROM users) SELECT * FROM temp;'
    ],
    correctAnswer: 0,
    explanation: 'CTEはWITH句で始まり、一時的な結果セットを定義できます。',
    level: 3
  },
  {
    id: 15,
    text: 'PIVOT操作で行を列に変換するSQLは？',
    options: [
      'SELECT * FROM sales PIVOT (SUM(amount) FOR month IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12));',
      'SELECT * FROM sales ROTATE (SUM(amount) FOR month IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12));',
      'SELECT * FROM sales CONVERT (SUM(amount) FOR month IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12));',
      'SELECT * FROM sales TRANSFORM (SUM(amount) FOR month IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12));'
    ],
    correctAnswer: 0,
    explanation: 'PIVOT操作は行を列に変換する機能で、集計関数とFOR句を使用します。',
    level: 3
  }
];

// 理解度テストの問題取得
router.get('/questions', (req, res) => {
  res.json(sampleQuestions);
});

// ユーザーの回答を受け取り、正誤判定してスコア・レベル・詳細を返す
router.post('/submit', (req, res) => {
  const { answers } = req.body; // 例: [0, 2, ...]
  let rawScore = 0;
  let weightedScore = 0;
  let beginner = 0, intermediate = 0, advanced = 0;
  const details = [];

  answers.forEach((ans, idx) => {
    const q = sampleQuestions[idx];
    if (!q) return;
    const isCorrect = ans === q.correctAnswer;
    
    if (isCorrect) {
      rawScore++;
      // 重み付けスコア（初級1点、中級2点、上級3点）
      weightedScore += q.level;
      
      // レベル別正解数
      if (q.level === 1) beginner++;
      else if (q.level === 2) intermediate++;
      else if (q.level === 3) advanced++;
    }
    
    details.push({
      question: q.text,
      userAnswer: ans,
      isCorrect,
      correctAnswer: q.correctAnswer,
      correctAnswerText: q.options[q.correctAnswer],
      explanation: q.explanation,
      level: q.level
    });
  });

  // より詳細なレベル判定ロジック
  let level = 1;
  let levelLabel = '初級';
  let feedback = '';

  // 上級判定
  if (advanced >= 4) {
    level = 3;
    levelLabel = '上級';
    feedback = '上級レベルのSQL知識をお持ちです。複雑なクエリや高度な機能を理解されています。';
  }
  // 中級判定
  else if (intermediate >= 4 || (intermediate >= 3 && advanced >= 1) || weightedScore >= 8) {
    level = 2;
    levelLabel = '中級';
    feedback = '中級レベルのSQL知識をお持ちです。基本的な操作から応用的な操作まで理解されています。';
  }
  // 初級判定
  else if (beginner >= 3 || rawScore >= 3) {
    level = 1;
    levelLabel = '初級';
    feedback = '初級レベルのSQL知識をお持ちです。基本的なSQL操作を理解されています。';
  }
  // 完全初心者
  else {
    level = 1;
    levelLabel = '初級';
    feedback = 'SQLの基礎から学習を始めることをお勧めします。';
  }

  // 詳細な分析情報
  const analysis = {
    rawScore,
    weightedScore,
    maxWeightedScore: 15, // 初級5問×1点 + 中級5問×2点 + 上級5問×3点 = 30点
    levelBreakdown: {
      beginner: { correct: beginner, total: 5, percentage: Math.round((beginner / 5) * 100) },
      intermediate: { correct: intermediate, total: 5, percentage: Math.round((intermediate / 5) * 100) },
      advanced: { correct: advanced, total: 5, percentage: Math.round((advanced / 5) * 100) }
    }
  };

  res.json({
    score: rawScore,
    weightedScore,
    total: sampleQuestions.length,
    level,
    levelLabel,
    message: `あなたのスコアは${rawScore}/${sampleQuestions.length}点（重み付けスコア: ${weightedScore}点）です。あなたは${levelLabel}レベルです。`,
    feedback,
    analysis,
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