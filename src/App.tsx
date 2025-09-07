import React, { useState, useEffect } from 'react';
import { LevelTest } from './components/LevelTest';
import { ProblemGen } from './components/ProblemGen';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { User, UserProgress } from './types';
import { api } from './services/api';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [proceedToPractice, setProceedToPractice] = useState(false);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [currentView, setCurrentView] = useState<'practice' | 'dashboard'>('practice');

  const updateUserProgress = async (userId: string) => {
    try {
      const progress = await api.getUserProgress(userId);
      setUserProgress(progress);
    } catch (error) {
      console.error('ユーザー進捗の更新に失敗しました:', error);
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      // ページ読み込み時にログイン状態と進捗を復元
      const userLevel = localStorage.getItem('userLevel');
      const username = localStorage.getItem('username') || 'User'; // 仮のユーザー名
      setUser({ id: parseInt(userId), username, level: userLevel ? parseInt(userLevel) : null });
      updateUserProgress(userId);
      
      // 保存されたビュー状態を復元
      const savedView = localStorage.getItem('currentView') as 'practice' | 'dashboard';
      if (savedView) {
        setCurrentView(savedView);
        if (savedView === 'dashboard') {
          setProceedToPractice(true);
        }
      }
    }
  }, []);

  const handleLogin = (user: User) => {
    setUser(user);
    localStorage.setItem('userId', String(user.id));
    localStorage.setItem('username', user.username);
    localStorage.setItem('userLevel', user.level !== null ? String(user.level) : '');
    updateUserProgress(String(user.id));
    
    // ログイン後にダッシュボードが選択されている場合は、練習問題画面に進むフラグを設定
    if (currentView === 'dashboard') {
      setProceedToPractice(true);
    }
  };

  const handleLevelUpdate = (level: number) => {
    if (user) {
      setUser({ ...user, level });
      localStorage.setItem('userLevel', String(level));
    }
  };

  const handleLogout = () => {
    setUser(null);
    setUserProgress(null);
    localStorage.removeItem('userId');
    localStorage.removeItem('userLevel');
    localStorage.removeItem('username');
    localStorage.removeItem('lastAssessmentResult');
    localStorage.removeItem('currentView');
    setProceedToPractice(false);
    setCurrentView('practice');
  };

  return (
    <div className="container">
      {user && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <span>ようこそ、{user.username} さん</span>
            {userProgress && (
              <div style={{ marginLeft: 20, fontSize: '0.9em', color: '#666' }}>
                これまでに回答した問題数: {userProgress.totalProblemsAnswered}問
              </div>
            )}

          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className={`button ${currentView === 'practice' ? 'active' : ''}`}
              onClick={() => {
                console.log('練習問題ボタンがクリックされました');
                setCurrentView('practice');
                setProceedToPractice(true);
                localStorage.setItem('currentView', 'practice');
              }}
              title="練習問題"
            >
              <span className="button-text">練習問題</span>
              <span className="button-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M13 3L5 11L3 9L11 1L13 3Z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M5 11L3 13" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M14 4L12 2" stroke="currentColor" strokeWidth="1.5"/>
                  <circle cx="12" cy="3" r="1" fill="currentColor"/>
                </svg>
              </span>
            </button>
            <button 
              className={`button ${currentView === 'dashboard' ? 'active' : ''}`}
              onClick={() => {
                console.log('ダッシュボードボタンがクリックされました');
                setCurrentView('dashboard');
                setProceedToPractice(true);
                localStorage.setItem('currentView', 'dashboard');
              }}
              title="ダッシュボード"
            >
              <span className="button-text">ダッシュボード</span>
              <span className="button-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="5" height="5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <rect x="9" y="2" width="5" height="5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <rect x="2" y="9" width="5" height="5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <rect x="9" y="9" width="5" height="5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                </svg>
              </span>
            </button>
            <button 
              className="button" 
              onClick={handleLogout}
              title="ログアウト"
            >
              <span className="button-text">ログアウト</span>
              <span className="button-icon">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="2" y="2" width="8" height="12" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M12 6L14 8L12 10" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  <path d="M10 8H14" stroke="currentColor" strokeWidth="1.5"/>
                </svg>
              </span>
            </button>
          </div>
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
      ) : currentView === 'dashboard' ? (
        <Dashboard />
      ) : (
        <ProblemGen 
          userProgress={userProgress}
          onProgressUpdate={() => updateUserProgress(String(user.id))}
        />
      )}
    </div>
  );
};

export default App; 