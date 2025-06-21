import axios from 'axios';
import { Question, Problem, Feedback, AssessmentResult, UserProgress, DailyProgress } from '../types';

const API_BASE_URL = 'http://localhost:3001';

export const api = {
  // 理解度テスト関連
  getAssessmentQuestions: async (): Promise<Question[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/assessment/questions`);
    return response.data;
  },

  submitAssessment: async (answers: number[]): Promise<AssessmentResult> => {
    const response = await axios.post(`${API_BASE_URL}/api/assessment/submit`, { answers });
    return response.data;
  },

  // 問題生成関連
  getProblem: async (level: number): Promise<Problem> => {
    const response = await axios.post(`${API_BASE_URL}/api/problems/generate?level=${level}`);
    return response.data;
  },

  // SQLフィードバック関連
  getFeedback: async (sql: string, expectedResult: string): Promise<Feedback> => {
    const response = await axios.post(`${API_BASE_URL}/api/feedback`, { sql, expectedResult });
    return response.data;
  },

  // ユーザー進捗管理
  getUserProgress: async (userId: string): Promise<UserProgress> => {
    const response = await axios.get(`${API_BASE_URL}/api/progress/${userId}`);
    return response.data;
  },

  saveDailyProgress: async (progress: DailyProgress): Promise<void> => {
    await axios.post(`${API_BASE_URL}/api/progress/daily`, progress);
  }
}; 