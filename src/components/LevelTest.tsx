import React, { useState, useEffect } from 'react';
import { Question, AssessmentResult } from '../types';
import { api } from '../services/api';

export const LevelTest: React.FC = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);

  useEffect(() => {
    loadQuestions();
  }, []);

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
    } catch (error) {
      console.error('評価の送信に失敗しました:', error);
    }
  };

  if (loading) {
    return <div className="loading">問題を読み込み中...</div>;
  }

  if (showResults && result) {
    return (
      <div className="card">
        <h2>評価結果</h2>
        <p>スコア: {result.score}点</p>
        <p>レベル: {result.level}</p>
        <p>{result.feedback}</p>
        <button className="button" onClick={() => window.location.reload()}>
          問題に戻る
        </button>
      </div>
    );
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