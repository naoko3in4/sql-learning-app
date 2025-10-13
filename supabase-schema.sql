-- Supabase用のデータベーススキーマ
-- PostgreSQL形式で作成

-- ユーザーテーブル
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT,
  level INTEGER DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 問題テーブル
CREATE TABLE IF NOT EXISTS problems (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  table_structure TEXT NOT NULL,
  sample_data TEXT NOT NULL,
  expected_result TEXT NOT NULL,
  hints TEXT NOT NULL,
  level INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ユーザー回答テーブル
CREATE TABLE IF NOT EXISTS user_answers (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  problem_id INTEGER NOT NULL,
  user_sql TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  feedback_syntax_check TEXT,
  feedback_suggestions TEXT,
  feedback_improved_sql TEXT,
  feedback_changes TEXT,
  feedback_learning_points TEXT,
  score INTEGER DEFAULT 0,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (problem_id) REFERENCES problems(id) ON DELETE CASCADE
);

-- ユーザー進捗テーブル
CREATE TABLE IF NOT EXISTS user_progress (
  user_id INTEGER PRIMARY KEY,
  total_problems_answered INTEGER DEFAULT 0,
  total_problems_correct INTEGER DEFAULT 0,
  current_score INTEGER DEFAULT 0,
  last_solved_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 日次進捗テーブル
CREATE TABLE IF NOT EXISTS daily_progress (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  date DATE NOT NULL,
  problems_solved INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(user_id, date)
);

-- インデックスの作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_user_answers_user_id ON user_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_problem_id ON user_answers(problem_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_answered_at ON user_answers(answered_at);
CREATE INDEX IF NOT EXISTS idx_daily_progress_user_date ON daily_progress(user_id, date);
CREATE INDEX IF NOT EXISTS idx_problems_level ON problems(level);

-- 更新日時の自動更新用トリガー関数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- トリガーの作成
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- サンプルデータの挿入
INSERT INTO problems (title, description, table_structure, sample_data, expected_result, hints, level) VALUES
(
  '基本的なSELECT文',
  'employeesテーブルから全ての従業員の名前を取得してください。',
  'CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT,
  salary INTEGER
);',
  'INSERT INTO employees VALUES
(1, ''田中太郎'', ''営業部'', 300000),
(2, ''佐藤花子'', ''開発部'', 350000),
(3, ''鈴木一郎'', ''営業部'', 280000),
(4, ''高橋美咲'', ''人事部'', 320000);',
  'name
田中太郎
佐藤花子
鈴木一郎
高橋美咲',
  '["SELECT文を使用してデータを取得します", "全ての列を取得するには * を使用します", "または特定の列名を指定します"]',
  1
),
(
  'WHERE句による条件指定',
  'employeesテーブルから営業部の従業員のみを取得してください。',
  'CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT,
  salary INTEGER
);',
  'INSERT INTO employees VALUES
(1, ''田中太郎'', ''営業部'', 300000),
(2, ''佐藤花子'', ''開発部'', 350000),
(3, ''鈴木一郎'', ''営業部'', 280000),
(4, ''高橋美咲'', ''人事部'', 320000);',
  'id|name|department|salary
1|田中太郎|営業部|300000
3|鈴木一郎|営業部|280000',
  '["WHERE句を使用して条件を指定します", "文字列はシングルクォートで囲みます", "department = ''営業部'' という条件を使用します"]',
  1
),
(
  'ORDER BYによる並び替え',
  'employeesテーブルから従業員を給与の高い順に並び替えて取得してください。',
  'CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT,
  salary INTEGER
);',
  'INSERT INTO employees VALUES
(1, ''田中太郎'', ''営業部'', 300000),
(2, ''佐藤花子'', ''開発部'', 350000),
(3, ''鈴木一郎'', ''営業部'', 280000),
(4, ''高橋美咲'', ''人事部'', 320000);',
  'id|name|department|salary
2|佐藤花子|開発部|350000
4|高橋美咲|人事部|320000
1|田中太郎|営業部|300000
3|鈴木一郎|営業部|280000',
  '["ORDER BY句を使用して並び替えを行います", "降順にするには DESC を使用します", "昇順にするには ASC を使用します（省略可能）"]',
  1
),
(
  '集計関数の使用',
  'employeesテーブルから各部署の平均給与を計算してください。',
  'CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT,
  salary INTEGER
);',
  'INSERT INTO employees VALUES
(1, ''田中太郎'', ''営業部'', 300000),
(2, ''佐藤花子'', ''開発部'', 350000),
(3, ''鈴木一郎'', ''営業部'', 280000),
(4, ''高橋美咲'', ''人事部'', 320000);',
  'department|AVG(salary)
営業部|290000.0
開発部|350000.0
人事部|320000.0',
  '["GROUP BY句を使用してグループ化します", "AVG()関数を使用して平均を計算します", "部署ごとにグループ化する必要があります"]',
  2
),
(
  'JOIN文の使用',
  'employeesテーブルとdepartmentsテーブルを結合して、従業員名と部署名を取得してください。',
  'CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department_id INTEGER,
  salary INTEGER
);

CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT
);',
  'INSERT INTO employees VALUES
(1, ''田中太郎'', 1, 300000),
(2, ''佐藤花子'', 2, 350000),
(3, ''鈴木一郎'', 1, 280000);

INSERT INTO departments VALUES
(1, ''営業部'', ''東京''),
(2, ''開発部'', ''大阪'');',
  'name|department_name
田中太郎|営業部
佐藤花子|開発部
鈴木一郎|営業部',
  '["INNER JOINを使用してテーブルを結合します", "結合条件は department_id = departments.id です", "従業員名と部署名の列を選択します"]',
  2
)
ON CONFLICT DO NOTHING;
