import React, { useState } from 'react';
import { LevelTest } from './components/LevelTest';
import { ProblemGen } from './components/ProblemGen';
import { Login } from './components/Login';

interface User {
  id: number;
  username: string;
  level: number | null;
}

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [proceedToPractice, setProceedToPractice] = useState(false);

  // ログイン後にユーザー情報をセット
  const handleLogin = (user: User) => {
    setUser(user);
    localStorage.setItem('userId', String(user.id));
    localStorage.setItem('userLevel', user.level !== null ? String(user.level) : '');
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
    localStorage.removeItem('userId');
    localStorage.removeItem('userLevel');
    localStorage.removeItem('lastAssessmentResult');
    setProceedToPractice(false);
  };

  return (
    <div className="container">
      {/* ユーザー名とログアウトボタンをヘッダーの上に表示 */}
      {user && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <span>ようこそ、{user.username} さん</span>
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