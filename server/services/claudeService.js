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
    
    JSON形式で出力してください。
    `;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    return JSON.parse(response.content[0].text);
  }

  async generateProblem(userLevel, topic = null) {
    const prompt = `
    SQLの${userLevel}レベルの学習者向けに実践的な問題を1つ作成してください。
    ${topic ? `テーマ: ${topic}` : ''}
    
    以下の情報を含めてください：
    - 問題の説明
    - サンプルテーブル構造
    - サンプルデータ
    - 期待する結果の例
    - ヒント（3段階）
    
    JSON形式で出力してください。
    `;

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    });

    return JSON.parse(response.content[0].text);
  }

  async provideFeedback(userSQL, expectedResult, userLevel) {
    const prompt = `
    以下のSQLクエリを添削してください：

    ユーザーのSQL:
    ${userSQL}

    期待する結果:
    ${expectedResult}

    ユーザーレベル: ${userLevel}

    以下の観点で詳細にフィードバックしてください：
    1. 構文の正確性
    2. パフォーマンスの観点
    3. 可読性・保守性
    4. より良い書き方の提案
    5. 学習ポイント

    初心者にも分かりやすく、具体例を交えて説明してください。
    JSON形式で出力してください。
    `;

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2500,
      messages: [{ role: 'user', content: prompt }]
    });

    return JSON.parse(response.content[0].text);
  }
}

module.exports = new ClaudeService(); 