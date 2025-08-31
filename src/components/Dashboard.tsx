import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

interface DashboardStats {
  totalProblemsAnswered: number;
  totalProblemsCorrect: number;
  accuracyRate: number;
  currentScore: number;
  lastSolvedDate: string | null;
  todayProblemsSolved: number;
  todayScore: number;
  levelStats: Array<{
    level: number;
    totalAnswered: number;
    totalCorrect: number;
    accuracyRate: number;
  }>;
}

interface AnswerHistory {
  id: number;
  problemId: number;
  problemTitle: string;
  problemDescription: string;
  tableStructure: string;
  sampleData: string;
  expectedResult: string;
  problemLevel: number;
  userSQL: string;
  isCorrect: boolean;
  feedback: {
    syntaxCheck: string;
    suggestions: string[];
    improvedSQL: string;
    changes: string[];
    learningPoints: string[];
  };
  score: number;
  answeredAt: string;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  limit: number;
}

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [history, setHistory] = useState<AnswerHistory[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState<number | undefined>(undefined);
  const [expandedAnswers, setExpandedAnswers] = useState<Set<number>>(new Set());

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (userId) {
      loadDashboardData();
    }
  }, [userId, currentPage, selectedLevel]);

  const loadDashboardData = async () => {
    if (!userId) {
      console.log('ユーザーIDが見つかりません');
      return;
    }
    
    console.log('ダッシュボードデータを読み込み中...', { userId, currentPage, selectedLevel });
    setLoading(true);
    try {
      const [statsData, historyData] = await Promise.all([
        api.getDashboardStats(userId),
        api.getDashboardHistory(userId, currentPage, 20, selectedLevel)
      ]);
      
      console.log('統計データ:', statsData);
      console.log('履歴データ:', historyData);
      
      setStats(statsData);
      setHistory(historyData.answers);
      setPagination(historyData.pagination);
    } catch (error) {
      console.error('ダッシュボードデータの読み込みに失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAnswerExpansion = (answerId: number) => {
    const newExpanded = new Set(expandedAnswers);
    if (newExpanded.has(answerId)) {
      newExpanded.delete(answerId);
    } else {
      newExpanded.add(answerId);
    }
    setExpandedAnswers(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleLevelFilter = (level: number | undefined) => {
    setSelectedLevel(level);
    setCurrentPage(1);
  };

  if (loading) {
    return <div className="loading">ダッシュボードを読み込み中...</div>;
  }

  if (!stats) {
    return <div className="error">データの読み込みに失敗しました。</div>;
  }

  return (
    <div className="dashboard">
      <h1>学習ダッシュボード</h1>
      
      {/* 統計情報セクション */}
      <div className="stats-section">
        <h2>学習統計</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <h3>総解答数</h3>
            <p className="stat-number">{stats.totalProblemsAnswered}</p>
          </div>
          <div className="stat-card">
            <h3>正解数</h3>
            <p className="stat-number">{stats.totalProblemsCorrect}</p>
          </div>
          <div className="stat-card">
            <h3>正解率</h3>
            <p className="stat-number">{stats.accuracyRate}%</p>
          </div>
          <div className="stat-card">
            <h3>総スコア</h3>
            <p className="stat-number">{stats.currentScore}</p>
          </div>
          <div className="stat-card">
            <h3>本日の解答数</h3>
            <p className="stat-number">{stats.todayProblemsSolved}</p>
          </div>
          <div className="stat-card">
            <h3>本日のスコア</h3>
            <p className="stat-number">{stats.todayScore}</p>
          </div>
        </div>

        {/* レベル別統計 */}
        <div className="level-stats">
          <h3>レベル別統計</h3>
          <div className="level-stats-grid">
            {stats.levelStats.map((levelStat) => (
              <div key={levelStat.level} className="level-stat-card">
                <h4>レベル {levelStat.level}</h4>
                <p>解答数: {levelStat.totalAnswered}</p>
                <p>正解数: {levelStat.totalCorrect}</p>
                <p>正解率: {levelStat.accuracyRate}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 解答履歴セクション */}
      <div className="history-section">
        <div className="history-header">
          <h2>解答履歴</h2>
          <div className="filters">
            <select 
              value={selectedLevel || ''} 
              onChange={(e) => handleLevelFilter(e.target.value ? parseInt(e.target.value) : undefined)}
              className="level-filter"
            >
              <option value="">全レベル</option>
              <option value="1">レベル1</option>
              <option value="2">レベル2</option>
              <option value="3">レベル3</option>
            </select>
          </div>
        </div>

        {history.length === 0 ? (
          <p className="no-data">解答履歴がありません。</p>
        ) : (
          <div className="history-list">
            {history.map((answer) => (
              <div key={answer.id} className="answer-card">
                <div className="answer-header">
                  <div className="answer-info">
                    <h3>{answer.problemTitle}</h3>
                    <span className={`level-badge level-${answer.problemLevel}`}>
                      レベル {answer.problemLevel}
                    </span>
                    <span className={`result-badge ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                      {answer.isCorrect ? '正解' : '不正解'}
                    </span>
                    <span className="date">{formatDate(answer.answeredAt)}</span>
                  </div>
                  <button 
                    className="expand-btn"
                    onClick={() => toggleAnswerExpansion(answer.id)}
                  >
                    {expandedAnswers.has(answer.id) ? '詳細を隠す' : '詳細を表示'}
                  </button>
                </div>

                {expandedAnswers.has(answer.id) && (
                  <div className="answer-details">
                    <div className="problem-info">
                      <h4>問題内容</h4>
                      <p>{answer.problemDescription}</p>
                      
                      <h4>テーブル構造</h4>
                      <pre className="code-block">{answer.tableStructure}</pre>
                      
                      <h4>サンプルデータ</h4>
                      <pre className="code-block">{answer.sampleData}</pre>
                      
                      <h4>期待される結果</h4>
                      <pre className="code-block">{answer.expectedResult}</pre>
                    </div>

                    <div className="user-answer">
                      <h4>あなたの回答</h4>
                      <pre className={`code-block ${answer.isCorrect ? 'correct' : 'incorrect'}`}>
                        {answer.userSQL}
                      </pre>
                    </div>

                    <div className="feedback">
                      <h4>フィードバック</h4>
                      
                      {answer.feedback.syntaxCheck && (
                        <div className="feedback-section">
                          <h5>構文チェック</h5>
                          <p>{answer.feedback.syntaxCheck}</p>
                        </div>
                      )}

                      {answer.feedback.suggestions.length > 0 && (
                        <div className="feedback-section">
                          <h5>改善提案</h5>
                          <ul>
                            {answer.feedback.suggestions.map((suggestion, index) => (
                              <li key={index}>{suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {answer.feedback.improvedSQL && (
                        <div className="feedback-section">
                          <h5>改善されたSQL</h5>
                          <pre className="code-block">{answer.feedback.improvedSQL}</pre>
                        </div>
                      )}

                      {answer.feedback.learningPoints.length > 0 && (
                        <div className="feedback-section">
                          <h5>学習ポイント</h5>
                          <ul>
                            {answer.feedback.learningPoints.map((point, index) => (
                              <li key={index}>{point}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ページネーション */}
        {pagination && pagination.totalPages > 1 && (
          <div className="pagination">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="page-btn"
            >
              前へ
            </button>
            
            <span className="page-info">
              {currentPage} / {pagination.totalPages} ページ
              ({pagination.totalCount}件中 {(currentPage - 1) * pagination.limit + 1}-
              {Math.min(currentPage * pagination.limit, pagination.totalCount)}件)
            </span>
            
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === pagination.totalPages}
              className="page-btn"
            >
              次へ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
