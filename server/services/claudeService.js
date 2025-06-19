const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

class ClaudeService {
  async generateAssessment(level = 'beginner') {
    const prompt = `
    SQLの${level}レベルの理解度をチェックする選択式問題を5問作成してください。
    各問題には以下の形式で回答してください：
    - 問題文
    - 選択肢4つ（A, B, C, D）
    - 正解
    - 解説
    
    必ずダブルクォートのみを使った有効なJSON形式で、コードブロックやバッククォートを使わずに出力してください。
    `;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    let text = response.content[0].text.trim();
    // コードブロックやバッククォートを除去
    text = text.replace(/^```json|```$/g, '').replace(/`/g, '');
    return JSON.parse(text);
  }

  async generateProblem(userLevel, topic = null) {
    const prompt = `
    SQLの${userLevel}レベルの学習者向けに実践的な問題を1つ作成してください。
    ${topic ? `テーマ: ${topic}` : ''}
    
    以下の情報を必ず含めて、次のJSON形式で出力してください。
    必ず全てのフィールドを埋めてください。
    
    {
      "title": "問題タイトル",
      "description": "問題の説明",
      "tableStructure": "テーブル構造（例: users(id INTEGER, name TEXT)）",
      "sampleData": "サンプルデータ（例: 1,Taro\\n2,Hanako）",
      "expectedResult": "期待される結果（例: id,name\\n1,Taro\\n2,Hanako）",
      "hints": ["ヒント1", "ヒント2", "ヒント3"]
    }
    
    必ずダブルクォートのみを使った有効なJSON形式で、コードブロックやバッククォートを使わずに出力してください。
    `;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    });

    let text = response.content[0].text.trim();
    text = text.replace(/^```json|```$/g, '').replace(/`/g, '');
    return JSON.parse(text);
  }

  async provideFeedback(userSQL, expectedResult, userLevel) {
    const prompt = `
    以下のSQLクエリを添削してください：

    ユーザーのSQL:
    ${userSQL}

    期待する結果:
    ${expectedResult}

    ユーザーレベル: ${userLevel}

    以下のJSON形式で詳細なフィードバックを返してください：
    {
      "syntaxCheck": "構文チェック結果（正しい/間違いと理由）",
      "suggestions": ["改善提案1", "改善提案2", "改善提案3"],
      "improvedSQL": "修正されたSQLクエリ",
      "changes": [
        {
          "original": "元のコード",
          "improved": "修正後のコード",
          "reason": "変更理由の説明"
        }
      ],
      "learningPoints": ["学習ポイント1", "学習ポイント2", "学習ポイント3"]
    }

    修正案では以下の点を考慮してください：
    1. 構文エラーの修正（= と IS の使い分け、DISTINCTの追加など）
    2. 可読性の向上（インデント、AS句の追加など）
    3. パフォーマンスの改善（DISTINCTの適切な使用など）
    4. SQLのベストプラクティスに従った書き方

    必ずダブルクォートのみを使った有効なJSON形式で、コードブロックやバッククォートを使わずに出力してください。
    `;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }]
    });

    let text = response.content[0].text.trim();
    text = text.replace(/^```json|```$/g, '').replace(/`/g, '');
    return JSON.parse(text);
  }
}

module.exports = new ClaudeService(); 