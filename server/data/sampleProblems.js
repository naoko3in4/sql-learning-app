const sampleProblems = [
  {
    id: 1,
    title: "基本的なSELECT文",
    description: "employeesテーブルから全ての従業員の名前を取得してください。",
    tableStructure: `CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT,
  salary INTEGER
);`,
    sampleData: `INSERT INTO employees VALUES
(1, '田中太郎', '営業部', 300000),
(2, '佐藤花子', '開発部', 350000),
(3, '鈴木一郎', '営業部', 280000),
(4, '高橋美咲', '人事部', 320000);`,
    expectedResult: `name
田中太郎
佐藤花子
鈴木一郎
高橋美咲`,
    hints: [
      "SELECT文を使用してデータを取得します",
      "全ての列を取得するには * を使用します",
      "または特定の列名を指定します"
    ],
    level: 1
  },
  {
    id: 2,
    title: "WHERE句による条件指定",
    description: "employeesテーブルから営業部の従業員のみを取得してください。",
    tableStructure: `CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT,
  salary INTEGER
);`,
    sampleData: `INSERT INTO employees VALUES
(1, '田中太郎', '営業部', 300000),
(2, '佐藤花子', '開発部', 350000),
(3, '鈴木一郎', '営業部', 280000),
(4, '高橋美咲', '人事部', 320000);`,
    expectedResult: `id|name|department|salary
1|田中太郎|営業部|300000
3|鈴木一郎|営業部|280000`,
    hints: [
      "WHERE句を使用して条件を指定します",
      "文字列はシングルクォートで囲みます",
      "department = '営業部' という条件を使用します"
    ],
    level: 1
  },
  {
    id: 3,
    title: "ORDER BYによる並び替え",
    description: "employeesテーブルから従業員を給与の高い順に並び替えて取得してください。",
    tableStructure: `CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT,
  salary INTEGER
);`,
    sampleData: `INSERT INTO employees VALUES
(1, '田中太郎', '営業部', 300000),
(2, '佐藤花子', '開発部', 350000),
(3, '鈴木一郎', '営業部', 280000),
(4, '高橋美咲', '人事部', 320000);`,
    expectedResult: `id|name|department|salary
2|佐藤花子|開発部|350000
4|高橋美咲|人事部|320000
1|田中太郎|営業部|300000
3|鈴木一郎|営業部|280000`,
    hints: [
      "ORDER BY句を使用して並び替えを行います",
      "降順にするには DESC を使用します",
      "昇順にするには ASC を使用します（省略可能）"
    ],
    level: 1
  },
  {
    id: 4,
    title: "集計関数の使用",
    description: "employeesテーブルから各部署の平均給与を計算してください。",
    tableStructure: `CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department TEXT,
  salary INTEGER
);`,
    sampleData: `INSERT INTO employees VALUES
(1, '田中太郎', '営業部', 300000),
(2, '佐藤花子', '開発部', 350000),
(3, '鈴木一郎', '営業部', 280000),
(4, '高橋美咲', '人事部', 320000);`,
    expectedResult: `department|AVG(salary)
営業部|290000.0
開発部|350000.0
人事部|320000.0`,
    hints: [
      "GROUP BY句を使用してグループ化します",
      "AVG()関数を使用して平均を計算します",
      "部署ごとにグループ化する必要があります"
    ],
    level: 2
  },
  {
    id: 5,
    title: "JOIN文の使用",
    description: "employeesテーブルとdepartmentsテーブルを結合して、従業員名と部署名を取得してください。",
    tableStructure: `CREATE TABLE employees (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  department_id INTEGER,
  salary INTEGER
);

CREATE TABLE departments (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT
);`,
    sampleData: `INSERT INTO employees VALUES
(1, '田中太郎', 1, 300000),
(2, '佐藤花子', 2, 350000),
(3, '鈴木一郎', 1, 280000);

INSERT INTO departments VALUES
(1, '営業部', '東京'),
(2, '開発部', '大阪');`,
    expectedResult: `name|department_name
田中太郎|営業部
佐藤花子|開発部
鈴木一郎|営業部`,
    hints: [
      "INNER JOINを使用してテーブルを結合します",
      "結合条件は department_id = departments.id です",
      "従業員名と部署名の列を選択します"
    ],
    level: 2
  }
];

module.exports = sampleProblems; 