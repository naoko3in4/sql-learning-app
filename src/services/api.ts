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
  getProblem: async (level: number, userId: string): Promise<Problem> => {
    const response = await axios.post(`${API_BASE_URL}/api/problems/generate`, { 
      level, 
      userId 
    });
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

  

  // 回答履歴取得
  getAnswerHistory: async (userId: string, limit: number = 10, offset: number = 0): Promise<any[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/feedback/history/${userId}?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  // 学習統計取得
  getUserStats: async (userId: string): Promise<any> => {
    const response = await axios.get(`${API_BASE_URL}/api/progress/stats/${userId}`);
    return response.data;
  },

  // ダッシュボード関連
  getDashboardStats: async (userId: string): Promise<any> => {
    const response = await axios.get(`${API_BASE_URL}/api/dashboard/stats/${userId}`);
    return response.data;
  },

  getDashboardHistory: async (userId: string, page: number = 1, limit: number = 20, level?: number): Promise<any> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString()
    });
    if (level) {
      params.append('level', level.toString());
    }
    const response = await axios.get(`${API_BASE_URL}/api/dashboard/history/${userId}?${params}`);
    return response.data;
  },

  getRecentAnswers: async (userId: string): Promise<any[]> => {
    const response = await axios.get(`${API_BASE_URL}/api/dashboard/recent/${userId}`);
    return response.data;
  }
}; 