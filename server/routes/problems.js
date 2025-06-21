const express = require('express');
const router = express.Router();
const claudeService = require('../services/claudeService');
const path = require('path');
const Database = require('better-sqlite3');
const dbPath = path.join(__dirname, '../..', 'sample.db');
const db = new Database(dbPath);
const sampleProblems = require('../data/sampleProblems');

// 環境変数の確認
const USE_SAMPLE_PROBLEMS = process.env.USE_SAMPLE_PROBLEMS === 'true';

// 問題をDBに保存
const saveProblemToDB = (problem) => {
  const stmt = db.prepare(`
    INSERT INTO problems (title, description, table_structure, sample_data, expected_result, hints, level)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(
    problem.title,
    problem.description,
    problem.tableStructure,
    problem.sampleData,
    problem.expectedResult,
    JSON.stringify(problem.hints),
    problem.level
  );
  return result.lastInsertRowid;
};

// DBから問題を取得
const getProblemFromDB = (problemId) => {
  const problem = db.prepare('SELECT * FROM problems WHERE id = ?').get(problemId);
  if (problem) {
    return {
      id: problem.id,
      title: problem.title,
      description: problem.description,
      tableStructure: problem.table_structure,
      sampleData: problem.sample_data,
      expectedResult: problem.expected_result,
      hints: JSON.parse(problem.hints),
      level: problem.level
    };
  }
  return null;
};

// ランダムな問題をDBから取得
const getRandomProblemFromDB = (level) => {
  const problem = db.prepare('SELECT * FROM problems WHERE level = ? ORDER BY RANDOM() LIMIT 1').get(level);
  if (problem) {
    return {
      id: problem.id,
      title: problem.title,
      description: problem.description,
      tableStructure: problem.table_structure,
      sampleData: problem.sample_data,
      expectedResult: problem.expected_result,
      hints: JSON.parse(problem.hints),
      level: problem.level
    };
  }
  return null;
};

// サンプル問題からランダムに選択
const getRandomSampleProblem = (level) => {
  const levelProblems = sampleProblems.filter(p => p.level === level);
  if (levelProblems.length > 0) {
    return levelProblems[Math.floor(Math.random() * levelProblems.length)];
  }
  // 該当レベルがない場合はレベル1の問題を返す
  return sampleProblems.find(p => p.level === 1) || sampleProblems[0];
};

// 問題生成（環境変数に応じてサンプル問題またはClaude APIを使用）
router.post('/generate', async (req, res) => {
  try {
    const { level = 1 } = req.query;
    const userLevel = parseInt(level);

    let problem;

    if (USE_SAMPLE_PROBLEMS) {
      // サンプル問題を使用
      console.log('サンプル問題を使用します');
      problem = getRandomSampleProblem(userLevel);
      
      // DBに保存（まだ保存されていない場合）
      const existingProblem = getRandomProblemFromDB(userLevel);
      if (!existingProblem) {
        const problemId = saveProblemToDB(problem);
        problem.id = problemId;
      } else {
        problem.id = existingProblem.id;
      }
    } else {
      // Claude APIを使用
      console.log('Claude APIを使用します');
      
      // まずDBからランダムな問題を取得
      problem = getRandomProblemFromDB(userLevel);

      // DBに問題がない場合は、Claudeで問題を生成
      if (!problem) {
        try {
          const generatedProblem = await claudeService.generateProblem(userLevel);
          problem = {
            ...generatedProblem,
            level: userLevel
          };
          
          // DBに保存
          const problemId = saveProblemToDB(problem);
          problem.id = problemId;
        } catch (error) {
          console.error('Claudeでの問題生成に失敗:', error);
          // Claude APIが失敗した場合はサンプル問題を使用
          problem = getRandomSampleProblem(userLevel);
          const problemId = saveProblemToDB(problem);
          problem.id = problemId;
        }
      }
    }

    res.json(problem);
  } catch (error) {
    console.error('問題生成エラー:', error);
    res.status(500).json({ error: '問題の生成に失敗しました' });
  }
});

// 特定の問題を取得
router.get('/:id', (req, res) => {
  try {
    const problemId = parseInt(req.params.id);
    const problem = getProblemFromDB(problemId);
    
    if (problem) {
      res.json(problem);
    } else {
      res.status(404).json({ error: '問題が見つかりません' });
    }
  } catch (error) {
    console.error('問題取得エラー:', error);
    res.status(500).json({ error: '問題の取得に失敗しました' });
  }
});

// 問題一覧を取得
router.get('/', (req, res) => {
  try {
    const { level } = req.query;
    let query = 'SELECT * FROM problems';
    let params = [];

    if (level) {
      query += ' WHERE level = ?';
      params.push(parseInt(level));
    }

    query += ' ORDER BY created_at DESC';
    const problems = db.prepare(query).all(...params);

    const formattedProblems = problems.map(problem => ({
      id: problem.id,
      title: problem.title,
      description: problem.description,
      tableStructure: problem.table_structure,
      sampleData: problem.sample_data,
      expectedResult: problem.expected_result,
      hints: JSON.parse(problem.hints),
      level: problem.level,
      createdAt: problem.created_at
    }));

    res.json(formattedProblems);
  } catch (error) {
    console.error('問題一覧取得エラー:', error);
    res.status(500).json({ error: '問題一覧の取得に失敗しました' });
  }
});

module.exports = router; 