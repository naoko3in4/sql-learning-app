import React, { useState, useEffect } from 'react';
import { Problem, UserProgress } from '../types';
import { api } from '../services/api';
import { SQLEditor } from './SQLEditor';

export const ProblemGen: React.FC = () => {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentHintIndex, setCurrentHintIndex] = useState(-1);
  const [problemsSolved, setProblemsSolved] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [showContinueModal, setShowContinueModal] = useState(false);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);

  useEffect(() => {
    loadProblem();
    loadUserProgress();
  }, []);

  const loadProblem = async () => {
    try {
      const userLevel = parseInt(localStorage.getItem('userLevel') || '1');
      const newProblem = await api.getProblem(userLevel);
      setProblem(newProblem);
    } catch (error) {
      console.error('問題の読み込みに失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserProgress = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        const progress = await api.getUserProgress(userId);
        setUserProgress(progress);
        setProblemsSolved(progress.problemsSolvedToday);
        setCurrentScore(progress.currentScore);
      }
    } catch (error) {
      console.error('ユーザー進捗の読み込みに失敗しました:', error);
    }
  };

  const showNextHint = () => {
    if (problem && currentHintIndex < problem.hints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
    }
  };

  const handleProblemSolved = (score: number) => {
    const newProblemsSolved = problemsSolved + 1;
    const newScore = currentScore + score;
    
    setProblemsSolved(newProblemsSolved);
    setCurrentScore(newScore);

    // 3問回答後に継続確認モーダルを表示
    if (newProblemsSolved >= 3) {
      setShowContinueModal(true);
    }
  };

  const handleNextProblem = async () => {
    await loadProblem();
    setCurrentHintIndex(-1);
  };

  const handleContinue = async () => {
    setShowContinueModal(false);
    await handleNextProblem();
  };

  const handleStop = () => {
    setShowContinueModal(false);
    // ホーム画面に戻るなどの処理
    window.location.href = '/';
  };

  const saveProgress = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (userId) {
        await api.saveDailyProgress({
          userId,
          date: new Date().toISOString().split('T')[0],
          problemsSolved,
          score: currentScore
        });
      }
    } catch (error) {
      console.error('進捗の保存に失敗しました:', error);
    }
  };

  if (loading) {
    return <div className="loading">問題を読み込み中...</div>;
  }

  if (!problem) {
    return <div className="error">問題の読み込みに失敗しました。</div>;
  }

  return (
    <div className="card">
      {/* 進捗情報表示 */}
      <div className="progress-info">
        <div className="score">
          本日の進捗: {problemsSolved}問回答済み / スコア: {currentScore}点
        </div>
      </div>

      <h2>{problem.title}</h2>
      <p>{problem.description}</p>

      <div className="table-structure">
        <h3>テーブル構造</h3>
        <pre>{problem.tableStructure}</pre>
      </div>

      <div className="sample-data">
        <h3>サンプルデータ</h3>
        <pre>{problem.sampleData}</pre>
      </div>

      <div className="expected-result">
        <h3>期待される結果</h3>
        <pre>{problem.expectedResult}</pre>
      </div>

      <div className="hints">
        <h3>ヒント</h3>
        <button
          className="button"
          onClick={showNextHint}
          disabled={currentHintIndex >= problem.hints.length - 1}
        >
          次のヒントを表示
        </button>
        {problem.hints.slice(0, currentHintIndex + 1).map((hint, index) => (
          <div key={index} className="hint">
            <p>ヒント {index + 1}: {hint}</p>
          </div>
        ))}
      </div>

      <SQLEditor 
        expectedResult={problem.expectedResult}
        onNextProblem={handleNextProblem}
        onProblemSolved={handleProblemSolved}
      />

      {/* 継続確認モーダル */}
      {showContinueModal && (
        <div className="continue-modal">
          <div className="continue-modal-content">
            <h3>本日分は終了しました</h3>
            <p>本日は{problemsSolved}問回答し、{currentScore}点を獲得しました。</p>
            <p>続けますか？</p>
            <div className="continue-modal-buttons">
              <button className="continue-btn" onClick={handleContinue}>
                続ける
              </button>
              <button className="stop-btn" onClick={handleStop}>
                終了する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 