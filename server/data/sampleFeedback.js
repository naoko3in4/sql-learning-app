const sampleFeedback = {
  // 基本的なSELECT文のフィードバック
  "SELECT * FROM employees": {
    syntaxCheck: "✅ 構文は正しいです。基本的なSELECT文が適切に記述されています。",
    suggestions: [
      "特定の列のみを取得することを検討してください（パフォーマンス向上）",
      "必要に応じてWHERE句で条件を追加してください"
    ],
    improvedSQL: "SELECT name, department, salary FROM employees;",
    changes: [
      {
        original: "SELECT *",
        improved: "SELECT name, department, salary",
        reason: "必要な列のみを指定することで、パフォーマンスが向上し、コードの意図が明確になります。"
      }
    ],
    learningPoints: [
      "SELECT * は全ての列を取得しますが、必要な列のみを指定する方が効率的です",
      "列名を明示的に指定することで、クエリの意図が明確になります"
    ]
  },
  
  "SELECT name FROM employees": {
    syntaxCheck: "✅ 構文は正しいです。適切に列名を指定しています。",
    suggestions: [
      "必要に応じてWHERE句で条件を追加してください",
      "ORDER BY句で並び替えを検討してください"
    ],
    improvedSQL: "SELECT name FROM employees ORDER BY name;",
    changes: [
      {
        original: "SELECT name FROM employees",
        improved: "SELECT name FROM employees ORDER BY name",
        reason: "結果を名前順に並び替えることで、見やすくなります。"
      }
    ],
    learningPoints: [
      "ORDER BY句を使用することで結果を並び替えることができます",
      "デフォルトでは昇順（ASC）で並び替えられます"
    ]
  },

  // WHERE句のフィードバック
  "SELECT * FROM employees WHERE department = '営業部'": {
    syntaxCheck: "✅ 構文は正しいです。WHERE句が適切に使用されています。",
    suggestions: [
      "特定の列のみを取得することを検討してください",
      "インデックスが効くように条件を最適化してください"
    ],
    improvedSQL: "SELECT id, name, department, salary FROM employees WHERE department = '営業部';",
    changes: [
      {
        original: "SELECT *",
        improved: "SELECT id, name, department, salary",
        reason: "必要な列のみを指定することで、パフォーマンスが向上します。"
      }
    ],
    learningPoints: [
      "WHERE句を使用することで特定の条件に合う行のみを取得できます",
      "文字列はシングルクォートで囲む必要があります"
    ]
  },

  // ORDER BY句のフィードバック
  "SELECT * FROM employees ORDER BY salary DESC": {
    syntaxCheck: "✅ 構文は正しいです。ORDER BY句が適切に使用されています。",
    suggestions: [
      "特定の列のみを取得することを検討してください",
      "同じ給与の場合は名前順で並び替えることを検討してください"
    ],
    improvedSQL: "SELECT id, name, department, salary FROM employees ORDER BY salary DESC, name ASC;",
    changes: [
      {
        original: "SELECT *",
        improved: "SELECT id, name, department, salary",
        reason: "必要な列のみを指定することで、パフォーマンスが向上します。"
      },
      {
        original: "ORDER BY salary DESC",
        improved: "ORDER BY salary DESC, name ASC",
        reason: "同じ給与の場合は名前順で並び替えることで、結果が一意になります。"
      }
    ],
    learningPoints: [
      "ORDER BY句で複数の列を指定できます",
      "DESCは降順、ASCは昇順を指定します",
      "同じ値の場合は次の条件で並び替えられます"
    ]
  },

  // 集計関数のフィードバック
  "SELECT department, AVG(salary) FROM employees GROUP BY department": {
    syntaxCheck: "✅ 構文は正しいです。GROUP BY句と集計関数が適切に使用されています。",
    suggestions: [
      "結果を見やすくするために列にエイリアスを付けることを検討してください",
      "結果を並び替えることを検討してください"
    ],
    improvedSQL: "SELECT department, AVG(salary) as avg_salary FROM employees GROUP BY department ORDER BY avg_salary DESC;",
    changes: [
      {
        original: "AVG(salary)",
        improved: "AVG(salary) as avg_salary",
        reason: "列にエイリアスを付けることで、結果が分かりやすくなります。"
      },
      {
        original: "GROUP BY department",
        improved: "GROUP BY department ORDER BY avg_salary DESC",
        reason: "平均給与の高い順に並び替えることで、結果が見やすくなります。"
      }
    ],
    learningPoints: [
      "GROUP BY句を使用することで、指定した列でグループ化できます",
      "集計関数（AVG、SUM、COUNT等）はGROUP BY句と組み合わせて使用します",
      "AS句を使用して列にエイリアスを付けることができます"
    ]
  },

  // JOIN文のフィードバック
  "SELECT e.name, d.name FROM employees e JOIN departments d ON e.department_id = d.id": {
    syntaxCheck: "✅ 構文は正しいです。JOIN句が適切に使用されています。",
    suggestions: [
      "列名が重複する可能性があるため、エイリアスを使用してください",
      "結果を並び替えることを検討してください"
    ],
    improvedSQL: "SELECT e.name as employee_name, d.name as department_name FROM employees e JOIN departments d ON e.department_id = d.id ORDER BY e.name;",
    changes: [
      {
        original: "e.name, d.name",
        improved: "e.name as employee_name, d.name as department_name",
        reason: "列名にエイリアスを付けることで、結果が分かりやすくなります。"
      },
      {
        original: "ON e.department_id = d.id",
        improved: "ON e.department_id = d.id ORDER BY e.name",
        reason: "従業員名順に並び替えることで、結果が見やすくなります。"
      }
    ],
    learningPoints: [
      "JOIN句を使用することで複数のテーブルを結合できます",
      "テーブルにエイリアスを付けることで、クエリが簡潔になります",
      "ON句で結合条件を指定します"
    ]
  },

  // デフォルトフィードバック（該当するものがない場合）
  "default": {
    syntaxCheck: "構文を確認してください。",
    suggestions: [
      "SELECT文の基本構文を確認してください",
      "テーブル名と列名が正しいか確認してください"
    ],
    improvedSQL: "SELECT * FROM employees;",
    changes: [
      {
        original: "入力されたSQL",
        improved: "SELECT * FROM employees",
        reason: "基本的なSELECT文の例です。"
      }
    ],
    learningPoints: [
      "SELECT文の基本構文: SELECT 列名 FROM テーブル名",
      "WHERE句で条件を指定できます",
      "ORDER BY句で並び替えができます"
    ]
  }
};

module.exports = sampleFeedback; 