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
}

export interface AssessmentResult {
  score: number;
  level: number;
  feedback: string;
} 