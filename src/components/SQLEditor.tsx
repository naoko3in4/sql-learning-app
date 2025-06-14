import React, { useState } from 'react';
import { Feedback } from '../types';
import { api } from '../services/api';

interface SQLEditorProps {
  expectedResult: string;
}

export const SQLEditor: React.FC<SQLEditorProps> = ({ expectedResult }) => {
  const [sql, setSql] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!sql.trim()) return;

    setLoading(true);
    try {
      const result = await api.getFeedback(sql, expectedResult);
      setFeedback(result);
    } catch (error) {
      console.error('フィードバックの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3>SQLエディター</h3>
      <textarea
        value={sql}
        onChange={(e) => setSql(e.target.value)}
        placeholder="SQLクエリを入力してください..."
        rows={5}
        style={{ width: '100%', marginBottom: '10px' }}
      />
      <button
        className="button"
        onClick={handleSubmit}
        disabled={loading || !sql.trim()}
      >
        {loading ? '実行中...' : '実行'}
      </button>

      {feedback && (
        <div className="feedback">
          <h4>フィードバック</h4>
          <div className="syntax-check">
            <strong>構文チェック:</strong>
            <p>{feedback.syntaxCheck}</p>
          </div>
          {feedback.suggestions.length > 0 && (
            <div className="suggestions">
              <strong>改善提案:</strong>
              <ul>
                {feedback.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>
          )}
          {feedback.improvedSQL && (
            <div className="improved-sql">
              <strong>改善されたSQL:</strong>
              <pre>{feedback.improvedSQL}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 