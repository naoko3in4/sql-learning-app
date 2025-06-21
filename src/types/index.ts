export interface Question {
  id: number;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface Problem {
  id: number;
  title: string;
  description: string;
  tableStructure: string;
  sampleData: string;
  expectedResult: string;
  hints: string[];
  level: number;
}

export interface Feedback {
  syntaxCheck: string;
  suggestions: string[];
  improvedSQL?: string;
  changes?: {
    original: string;
    improved: string;
    reason: string;
  }[];
  learningPoints?: string[];
}

export interface AssessmentResult {
  score: number;
  level: number;
  levelLabel: string;
  feedback?: string;
  message?: string;
  total?: number;
  details?: {
    question: string;
    userAnswer: number | null;
    isCorrect: boolean;
    correctAnswer: number;
    correctAnswerText: string;
    explanation: string;
  }[];
}

export interface User {
  id: number;
  username: string;
  level: number | null;
}

export interface UserProgress {
  userId: string;
  totalProblemsSolved: number;
  currentScore: number;
  lastSolvedDate?: string;
  problemsSolvedToday: number;
}

export interface DailyProgress {
  userId: string;
  date: string;
  problemsSolved: number;
  score: number;
} 