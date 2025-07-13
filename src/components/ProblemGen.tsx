import React, { useState, useEffect } from 'react';
import { Problem, UserProgress } from '../types';
import { api } from '../services/api';
import { SQLEditor } from './SQLEditor';

interface ProblemGenProps {
  userProgress: UserProgress | null;
  onProgressUpdate: () => void;
}

export const ProblemGen: React.FC<ProblemGenProps> = ({ userProgress, onProgressUpdate }) => {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentHintIndex, setCurrentHintIndex] = useState(-1);
  const [showContinueModal, setShowContinueModal] = useState(false);

  useEffect(() => {
    loadProblem();
  }, []);

  const loadProblem = async () => {
    setLoading(true);
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

  const showNextHint = () => {
    if (problem && currentHintIndex < problem.hints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
    }
  };

  const handleProblemSolved = () => {
    onProgressUpdate(); // App.tsx に進捗更新を通知
    // 3問回答ごとにモーダルを出すロジックは、userProgress.problemsAnsweredToday を使う
    if (userProgress && (userProgress.problemsAnsweredToday + 1) % 3 === 0) {
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
    window.location.href = '/';
  };

  if (loading) {
    return <div className="loading">問題を読み込み中...</div>;
  }

  if (!problem) {
    return <div className="error">問題の読み込みに失敗しました。</div>;
  }

  return (
    <div className="card">
      <div className="progress-info">
        <div className="score">
          本日の進捗: {userProgress ? userProgress.problemsAnsweredToday : 0}問回答済み / スコア: {userProgress ? userProgress.currentScore : 0}点
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
        problemId={problem.id}
        onNextProblem={handleNextProblem}
        onProblemSolved={handleProblemSolved} // handleProblemSolved を渡す
        userProgress={userProgress} // userProgress を渡す
      />

      {showContinueModal && (
        <div className="continue-modal">
          <div className="continue-modal-content">
            <h3>本日分は終了しました</h3>
            <p>本日は{userProgress?.problemsAnsweredToday}問回答し、{userProgress?.currentScore}点を獲得しました。</p>
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