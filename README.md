# SQL 学習支援サービス

## 概要

このアプリは SQL の理解度チェックや問題演習、AI によるフィードバックを提供する学習支援サービスです。

---

## ローカル開発環境の立ち上げ手順

### 1. 依存パッケージのインストール

```bash
cd sql-learning-app
npm install
```

### 2. 環境変数ファイルの作成

プロジェクト直下に `.env` ファイルを作成し、Claude API キーなどを設定してください。

例：

```
ANTHROPIC_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. データベースの初期化

```bash
# データベーステーブルを作成
node server/db/init.js
```

### 4. サーバー（バックエンド）の起動

```bash
npm run server
```

### 5. フロントエンド（React アプリ）の起動

別のターミナルで：

```bash
npm start
```

### 6. アクセス

- フロントエンド: http://localhost:3000
- バックエンド API: http://localhost:3001

---

## SQLite データベースの確認

### データベースファイルの場所

- **メインデータベース**: `sql-learning-app/sample.db`

### データベース構造

```sql
-- ユーザー認証テーブル
users (id, username, password, level)

-- 問題テーブル
problems (id, title, description, table_structure, sample_data, expected_result, hints, level, created_at)

-- ユーザー回答履歴テーブル
user_answers (id, user_id, problem_id, user_sql, is_correct, feedback_syntax_check, feedback_suggestions, feedback_improved_sql, feedback_changes, feedback_learning_points, score, answered_at)

-- ユーザー進捗テーブル
user_progress (user_id, total_problems_solved, current_score, last_solved_date, problems_solved_today)

-- 日次進捗テーブル
daily_progress (id, user_id, date, problems_solved, score)
```

### データベース内容の確認コマンド

```bash
# SQLiteに接続
sqlite3 sample.db

# テーブル一覧を表示
.tables

# 各テーブルの構造を確認
.schema users
.schema problems
.schema user_answers
.schema user_progress
.schema daily_progress

# ユーザーデータの確認
SELECT * FROM users;

# 問題一覧の確認
SELECT id, title, level, created_at FROM problems ORDER BY created_at DESC;

# ユーザーの回答履歴を確認
SELECT
  ua.id,
  u.username,
  p.title as problem_title,
  ua.user_sql,
  ua.is_correct,
  ua.score,
  ua.answered_at
FROM user_answers ua
JOIN users u ON ua.user_id = u.id
JOIN problems p ON ua.problem_id = p.id
ORDER BY ua.answered_at DESC
LIMIT 10;

# ユーザーごとの進捗を確認
SELECT
  u.username,
  up.total_problems_solved,
  up.current_score,
  up.last_solved_date
FROM users u
LEFT JOIN user_progress up ON u.id = up.user_id;

# 日別の進捗サマリー
SELECT
  date,
  COUNT(DISTINCT user_id) as active_users,
  SUM(problems_solved) as total_problems,
  SUM(score) as total_score
FROM daily_progress
GROUP BY date
ORDER BY date DESC
LIMIT 10;

# SQLiteを終了
.quit
```

### 便利なクエリ例

```bash
# レベル別の問題数
SELECT level, COUNT(*) as problem_count FROM problems GROUP BY level;

# ユーザーごとの正答率
SELECT
  u.username,
  COUNT(*) as total_answers,
  SUM(CASE WHEN ua.is_correct = 1 THEN 1 ELSE 0 END) as correct_answers,
  ROUND(AVG(CASE WHEN ua.is_correct = 1 THEN 100.0 ELSE 0.0 END), 2) as accuracy_rate
FROM users u
LEFT JOIN user_answers ua ON u.id = ua.user_id
GROUP BY u.id, u.username
ORDER BY accuracy_rate DESC;

# 最近の問題生成状況
SELECT
  DATE(created_at) as date,
  COUNT(*) as problems_generated
FROM problems
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 7;

# 人気の問題（回答数が多い）
SELECT
  p.title,
  p.level,
  COUNT(ua.id) as answer_count,
  AVG(CASE WHEN ua.is_correct = 1 THEN 100.0 ELSE 0.0 END) as success_rate
FROM problems p
LEFT JOIN user_answers ua ON p.id = ua.problem_id
GROUP BY p.id, p.title, p.level
ORDER BY answer_count DESC
LIMIT 10;
```

### API 経由での確認

```bash
# 特定ユーザーの進捗を確認
curl http://localhost:3001/api/progress/1

# ユーザーの学習統計を確認
curl http://localhost:3001/api/progress/stats/1

# ユーザーの回答履歴を確認
curl http://localhost:3001/api/feedback/history/1

# 問題一覧を取得
curl http://localhost:3001/api/problems

# 特定の問題を取得
curl http://localhost:3001/api/problems/1
```

### 注意事項

- **データの永続化**: 全てのデータが SQLite に永続化されるため、サーバー再起動時もデータは保持されます
- **バックアップ**: `sample.db`ファイルは重要なデータを含むため、定期的にバックアップを取ることをお勧めします
- **パフォーマンス**: 大量のデータが蓄積された場合は、定期的なクリーンアップやインデックスの追加を検討してください

---

## 注意事項

- `.env`や`*.db`ファイルは Git 管理しないでください（`.gitignore`で除外済み）
- Claude API キーは有効なものを使用してください
- エラーが出た場合はエラーメッセージを確認し、依存パッケージや API キーの設定を見直してください

---

## ライセンス

MIT
