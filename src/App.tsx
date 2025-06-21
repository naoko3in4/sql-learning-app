import React, { useState, useEffect } from 'react';
import { LevelTest } from './components/LevelTest';
import { ProblemGen } from './components/ProblemGen';
import { Login } from './components/Login';
import { User, UserProgress } from './types';
import { api } from './services/api';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [proceedToPractice, setProceedToPractice] = useState(false);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);

  // ログイン後にユーザー情報をセット
  const handleLogin = async (user: User) => {
    setUser(user);
    localStorage.setItem('userId', String(user.id));
    localStorage.setItem('userLevel', user.level !== null ? String(user.level) : '');
    
    // ユーザー進捗を取得
    try {
      const progress = await api.getUserProgress(String(user.id));
      setUserProgress(progress);
    } catch (error) {
      console.error('ユーザー進捗の取得に失敗しました:', error);
    }
  };

  // レベル更新時にユーザー情報を更新
  const handleLevelUpdate = (level: number) => {
    if (user) {
      setUser({ ...user, level });
      localStorage.setItem('userLevel', String(level));
    }
  };

  // ログアウト処理
  const handleLogout = () => {
    setUser(null);
    setUserProgress(null);
    localStorage.removeItem('userId');
    localStorage.removeItem('userLevel');
    localStorage.removeItem('lastAssessmentResult');
    setProceedToPractice(false);
  };

  return (
    <div className="container">
      {/* ユーザー名とログアウトボタンをヘッダーの上に表示 */}
      {user && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <span>ようこそ、{user.username} さん</span>
            {userProgress && (
              <div style={{ marginLeft: 20, fontSize: '0.9em', color: '#666' }}>
                これまでに回答した問題数: {userProgress.totalProblemsSolved}問
              </div>
            )}
          </div>
          <button className="button" onClick={handleLogout}>ログアウト</button>
        </div>
      )}
      <header className="header">
        <h1>SQL学習支援サービス</h1>
      </header>
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : user.level === null ? (
        <LevelTest onLevelDecided={handleLevelUpdate} />
      ) : !proceedToPractice ? (
        <div className="card">
          <LevelTest onLevelDecided={handleLevelUpdate} showResultOnly />
          <button
            className="button"
            style={{ marginTop: 24 }}
            onClick={() => setProceedToPractice(true)}
          >
            練習問題に進む
          </button>
        </div>
      ) : (
        <ProblemGen />
      )}
    </div>
  );
};

export default App; 