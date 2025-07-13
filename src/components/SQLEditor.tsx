import React, { useState } from 'react';
import { Feedback, UserProgress } from '../types';
import { api } from '../services/api';

interface SQLEditorProps {
  expectedResult: string;
  problemId?: number;
  onNextProblem?: () => void;
  onProblemSolved?: () => void; // 引数なしに変更
  userProgress: UserProgress | null;
}

export const SQLEditor: React.FC<SQLEditorProps> = ({ 
  expectedResult, 
  problemId,
  onNextProblem, 
  onProblemSolved,
  userProgress
}) => {
  const [sql, setSql] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [showNextButton, setShowNextButton] = useState(false);

  const handleSubmit = async () => {
    if (!sql.trim()) return;

    setLoading(true);
    try {
      const userId = localStorage.getItem('userId') || undefined;
      const result = await api.getFeedback(sql, expectedResult, problemId, userId);
      setFeedback(result);
      setShowNextButton(true);
      if (onProblemSolved) {
        onProblemSolved(); // 進捗更新を通知
      }
    } catch (error) {
      console.error('フィードバックの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNextProblem = () => {
    setSql('');
    setFeedback(null);
    setShowNextButton(false);
    if (onNextProblem) {
      onNextProblem();
    }
  };

  return (
    <div className="card">
      <div className="score-display" style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        <h4>総合スコア</h4>
        {userProgress ? (
          <p>
            正解数 / 回答数: <strong>{userProgress.totalProblemsCorrect}</strong> / <strong>{userProgress.totalProblemsAnswered}</strong>
            <br />
            正解率: <strong>{userProgress.totalProblemsAnswered > 0 ? ((userProgress.totalProblemsCorrect / userProgress.totalProblemsAnswered) * 100).toFixed(1) : 0} %</strong>
          </p>
        ) : (
          <p>スコア情報を読み込んでいます...</p>
        )}
      </div>

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
            <p>{feedback.syntaxCheck || '構文チェック情報なし'}</p>
          </div>
          
          {Array.isArray(feedback.suggestions) && feedback.suggestions.length > 0 && (
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
          
          {Array.isArray(feedback.changes) && feedback.changes.length > 0 && (
            <div className="changes">
              <strong>変更点の詳細:</strong>
              <div className="changes-list">
                {feedback.changes.map((change, index) => (
                  <div key={index} className="change-item">
                    <div className="change-original">
                      <strong>元のコード:</strong>
                      <code>{change.original}</code>
                    </div>
                    <div className="change-improved">
                      <strong>修正後のコード:</strong>
                      <code>{change.improved}</code>
                    </div>
                    <div className="change-reason">
                      <strong>変更理由:</strong>
                      <p>{change.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {Array.isArray(feedback.learningPoints) && feedback.learningPoints.length > 0 && (
            <div className="learning-points">
              <strong>学習ポイント:</strong>
              <ul>
                {feedback.learningPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>
          )}
          
          {showNextButton && onNextProblem && (
            <div className="next-problem">
              <button 
                className="button" 
                onClick={handleNextProblem}
                style={{ marginTop: '15px' }}
              >
                次の問題に進む
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 