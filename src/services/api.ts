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
  getFeedback: async (sql: string, expectedResult: string, problemId?: number, userId?: string): Promise<Feedback> => {
    const response = await axios.post(`${API_BASE_URL}/api/feedback`, { 
      sql, 
      expectedResult, 
      problemId, 
      userId 
    });
    return response.data;
  },

  // ユーザー進捗管理
  getUserProgress: async (userId: string): Promise<UserProgress> => {
    const response = await axios.get(`${API_BASE_URL}/api/progress/${userId}`);
    return response.data;
  },

  saveDailyProgress: async (progress: DailyProgress): Promise<void> => {
    await axios.post(`${API_BASE_URL}/api/progress/daily`, progress);
  },

  // 回答履歴取得
  getAnswerHistory: async (userId: string, limit: number = 10, offset: number = 0): Promise<any[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/feedback/history/${userId}?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  // 学習統計取得
  getUserStats: async (userId: string): Promise<any> => {
    const response = await axios.get(`${API_BASE_URL}/api/progress/stats/${userId}`);
    return response.data;
  }
}; 