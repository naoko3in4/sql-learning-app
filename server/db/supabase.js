const { createClient } = require('@supabase/supabase-js');

// Supabase設定
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase環境変数が設定されていません');
  console.error('SUPABASE_URL と SUPABASE_ANON_KEY を設定してください');
}

const supabase = createClient(supabaseUrl, supabaseKey);

class SupabaseDB {
  // ユーザー関連
  async createUser(username, password, level = null) {
    const { data, error } = await supabase
      .from('users')
      .insert([
        { username, password, level }
      ])
      .select();
    
    if (error) throw error;
    return data[0];
  }

  async getUserByUsername(username) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async getUserById(id) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async updateUserLevel(userId, level) {
    const { data, error } = await supabase
      .from('users')
      .update({ level })
      .eq('id', userId)
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // 問題関連
  async getAllProblems() {
    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async getProblemById(id) {
    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  async getProblemsByLevel(level) {
    const { data, error } = await supabase
      .from('problems')
      .select('*')
      .eq('level', level)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async createProblem(problemData) {
    const { data, error } = await supabase
      .from('problems')
      .insert([problemData])
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // ユーザー回答関連
  async saveUserAnswer(answerData) {
    const { data, error } = await supabase
      .from('user_answers')
      .insert([answerData])
      .select();
    
    if (error) throw error;
    return data[0];
  }

  async getUserAnswers(userId, limit = 50) {
    const { data, error } = await supabase
      .from('user_answers')
      .select(`
        *,
        problems (
          title,
          level
        )
      `)
      .eq('user_id', userId)
      .order('answered_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }

  async getUserAnswerStats(userId) {
    const { data, error } = await supabase
      .from('user_answers')
      .select('is_correct, score')
      .eq('user_id', userId);
    
    if (error) throw error;
    
    const total = data.length;
    const correct = data.filter(d => d.is_correct).length;
    const totalScore = data.reduce((sum, d) => sum + (d.score || 0), 0);
    
    return {
      total,
      correct,
      incorrect: total - correct,
      accuracy: total > 0 ? Math.round((correct / total) * 100) : 0,
      totalScore
    };
  }

  // 進捗関連
  async getUserProgress(userId) {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateUserProgress(userId, progressData) {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        ...progressData
      })
      .select();
    
    if (error) throw error;
    return data[0];
  }

  async getDailyProgress(userId, days = 30) {
    const { data, error } = await supabase
      .from('daily_progress')
      .select('*')
      .eq('user_id', userId)
      .gte('date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async updateDailyProgress(userId, date, problemsSolved, score) {
    const { data, error } = await supabase
      .from('daily_progress')
      .upsert({
        user_id: userId,
        date,
        problems_solved: problemsSolved,
        score
      })
      .select();
    
    if (error) throw error;
    return data[0];
  }

  // ダッシュボード統計
  async getDashboardStats(userId) {
    const [progress, answers, dailyProgress] = await Promise.all([
      this.getUserProgress(userId),
      this.getUserAnswerStats(userId),
      this.getDailyProgress(userId, 7)
    ]);

    return {
      progress: progress || {
        total_problems_answered: 0,
        total_problems_correct: 0,
        current_score: 0,
        last_solved_date: null
      },
      answers,
      weeklyProgress: dailyProgress
    };
  }
}

module.exports = new SupabaseDB();
