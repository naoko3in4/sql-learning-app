import React, { useState, useEffect } from 'react';
import { LevelTest } from './components/LevelTest';
import { ProblemGen } from './components/ProblemGen';

const App: React.FC = () => {
  const [userLevel, setUserLevel] = useState<number | null>(null);
  const [hasCompletedTest, setHasCompletedTest] = useState(false);

  useEffect(() => {
    const level = localStorage.getItem('userLevel');
    if (level) {
      setUserLevel(parseInt(level));
      setHasCompletedTest(true);
    }
  }, []);

  const handleTestComplete = () => {
    setHasCompletedTest(true);
  };

  return (
    <div className="container">
      <header className="header">
        <h1>SQL学習支援サービス</h1>
      </header>
      {!hasCompletedTest ? (
        <LevelTest />
      ) : (
        <ProblemGen />
      )}
    </div>
  );
};

export default App; 