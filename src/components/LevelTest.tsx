import React, { useState, useEffect } from 'react';
import { Question, AssessmentResult } from '../types';
import { api } from '../services/api';
import axios from 'axios';

interface LevelTestProps {
  onLevelDecided?: (level: number) => void;
  onProceedToPractice?: () => void;
  showResultOnly?: boolean;
}

export const LevelTest: React.FC<LevelTestProps> = ({ onLevelDecided, onProceedToPractice, showResultOnly }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  useEffect(() => {
    if (!showResultOnly) {
      loadQuestions();
    } else {
      const savedResult = localStorage.getItem('lastAssessmentResult');
      if (savedResult) {
        setResult(JSON.parse(savedResult));
        setShowResults(true);
      }
    }
  }, [showResultOnly]);

  const loadQuestions = async () => {
    try {
      const loadedQuestions = await api.getAssessmentQuestions();
      setQuestions(loadedQuestions);
      setAnswers(new Array(loadedQuestions.length).fill(-1));
    } catch (error) {
      console.error('問題の読み込みに失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    try {
      const assessmentResult = await api.submitAssessment(answers);
      setResult(assessmentResult);
      setShowResults(true);
      localStorage.setItem('userLevel', assessmentResult.level.toString());
      localStorage.setItem('lastAssessmentResult', JSON.stringify(assessmentResult));
      // サーバーにもレベルを反映
      const userId = localStorage.getItem('userId');
      if (userId && assessmentResult.level) {
        await axios.post('/api/auth/update-level', { id: userId, level: assessmentResult.level });
        if (onLevelDecided) onLevelDecided(assessmentResult.level);
      }
    } catch (error) {
      console.error('評価の送信に失敗しました:', error);
    }
  };

  // showResultsの判定を修正
  const shouldShowResults = (showResults && result) || (showResultOnly && result);

  if (loading && !showResultOnly) {
    return <div className="loading">問題を読み込み中...</div>;
  }

  if (shouldShowResults) {
    return (
      <div className="card">
        <h2>評価結果</h2>
        <p>スコア: {result!.score}点</p>
        <p>レベル: {result!.levelLabel}</p>
        <p>{result!.feedback || result!.message}</p>
        <h3>各問題の正誤と解説</h3>
        <ul>
          {result!.details?.map((d, i) => (
            <li key={i} style={{ marginBottom: 8 }}>
              <strong>Q{i + 1}:</strong> {d.question}<br />
              あなたの回答: {d.userAnswer !== undefined && d.userAnswer !== null
                ? `${d.userAnswer + 1}番`
                : '未回答'}<br />
              <span>正解: {d.correctAnswer !== undefined && d.correctAnswer !== null ? `${d.correctAnswer + 1}番` : ''}
                {d.correctAnswerText ? `（${d.correctAnswerText}）` : ''}
              </span><br />
              {d.isCorrect ? (
                <span style={{ color: 'green' }}>正解</span>
              ) : (
                <span style={{ color: 'red' }}>不正解</span>
              )}
              <br />
              <span>解説: {d.explanation}</span>
            </li>
          ))}
        </ul>
        {onProceedToPractice && (
          <button className="button" onClick={onProceedToPractice}>
            OK（このレベルの練習問題に進む）
          </button>
        )}
        {!onProceedToPractice && (
          <button className="button" onClick={() => window.location.reload()}>
            もう一度テストする
          </button>
        )}
      </div>
    );
  }

  if (showResultOnly) {
    return null;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="card">
      <h2>SQL理解度テスト</h2>
      <p>問題 {currentQuestionIndex + 1} / {questions.length}</p>
      <div className="question">
        <h3>{currentQuestion.text}</h3>
        <div className="options">
          {currentQuestion.options.map((option, index) => (
            <div key={index} className="option">
              <input
                type="radio"
                id={`option-${index}`}
                name="answer"
                checked={answers[currentQuestionIndex] === index}
                onChange={() => handleAnswerSelect(index)}
              />
              <label htmlFor={`option-${index}`}>{option}</label>
            </div>
          ))}
        </div>
      </div>
      <button
        className="button"
        onClick={handleNext}
        disabled={answers[currentQuestionIndex] === -1}
      >
        {currentQuestionIndex < questions.length - 1 ? '次へ' : '完了'}
      </button>
    </div>
  );
}; 