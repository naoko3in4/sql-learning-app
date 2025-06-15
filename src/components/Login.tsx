import React, { useState } from 'react';
import axios from 'axios';

interface LoginProps {
  onLogin: (user: { id: number; username: string; level: number | null }) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isRegister) {
        const res = await axios.post('/api/auth/register', { username, password });
        onLogin(res.data);
      } else {
        const res = await axios.post('/api/auth/login', { username, password });
        onLogin(res.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || (isRegister ? '登録に失敗しました' : 'ログインに失敗しました'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>{isRegister ? '新規登録' : 'ログイン'}</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>ユーザー名：</label>
          <input
            type="text"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label>パスワード：</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button
            className="button"
            type="submit"
            style={{
              backgroundColor: isRegister ? '#6c757d' : '#007bff',
              width: '120px'
            }}
            disabled={loading}
          >
            {loading
              ? (isRegister ? '登録中...' : 'ログイン中...')
              : (isRegister ? '新規登録' : 'ログイン')}
          </button>
          <button
            type="button"
            className="button"
            style={{
              backgroundColor: isRegister ? '#007bff' : '#6c757d',
              width: '120px'
            }}
            onClick={() => { setIsRegister(!isRegister); setError(''); }}
          >
            {isRegister ? 'ログイン画面へ' : '新規登録はこちら'}
          </button>
        </div>
        {error && <div className="error" style={{ marginTop: '16px' }}>{error}</div>}
      </form>
    </div>
  );
}; 