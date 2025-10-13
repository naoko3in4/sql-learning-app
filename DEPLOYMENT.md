# SQL 学習アプリ - デプロイメントガイド

## Supabase + Vercel デプロイ手順

### 1. Supabase プロジェクトの作成

1. [Supabase](https://supabase.com)にアクセスしてアカウントを作成
2. 新しいプロジェクトを作成
3. プロジェクト設定から以下を取得：
   - Project URL
   - Anon Key

### 2. データベーススキーマの設定

1. Supabase ダッシュボードの「SQL Editor」に移動
2. `supabase-schema.sql`の内容をコピー&ペーストして実行
3. テーブルが正常に作成されたことを確認

### 3. Vercel デプロイ

#### 方法 1: Vercel CLI 使用

```bash
# 1. Vercel CLIをインストール
npm i -g vercel

# 2. プロジェクトディレクトリでログイン
vercel login

# 3. デプロイ
vercel

# 4. 環境変数を設定
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add ANTHROPIC_API_KEY
```

#### 方法 2: GitHub 連携

1. プロジェクトを GitHub にプッシュ
2. [Vercel](https://vercel.com)にアクセス
3. GitHub アカウントでログイン
4. プロジェクトをインポート
5. 環境変数を設定

### 4. 環境変数の設定

Vercel ダッシュボードまたは CLI で以下を設定：

```
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
ANTHROPIC_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 5. デプロイ後の確認

1. アプリケーションが正常に動作することを確認
2. ユーザー登録・ログイン機能をテスト
3. 問題生成・回答機能をテスト
4. データベースにデータが保存されることを確認

## トラブルシューティング

### よくある問題

1. **環境変数が設定されていない**

   - Vercel ダッシュボードで環境変数を確認
   - 再デプロイが必要な場合がある

2. **Supabase 接続エラー**

   - URL とキーが正しいか確認
   - Supabase プロジェクトがアクティブか確認

3. **CORS エラー**
   - Vercel の設定で CORS が適切に設定されているか確認

### ログの確認

```bash
# Vercel CLIでログを確認
vercel logs

# 特定のデプロイメントのログ
vercel logs [deployment-url]
```

## 将来の Heroku 移行について

### 移行の準備

1. **データベース**: Supabase は PostgreSQL ベースなので、Heroku Postgres への移行が容易
2. **環境変数**: Heroku Config Vars に移行
3. **デプロイ設定**: `Procfile`の作成

### 移行手順（将来）

1. Heroku アプリを作成
2. Heroku Postgres アドオンを追加
3. データを Supabase から Heroku Postgres に移行
4. 環境変数を Heroku Config Vars に設定
5. アプリケーションをデプロイ

## コスト比較

### Vercel（推奨開始点）

- **無料枠**: 100GB 帯域幅/月、1000 サーバーレス関数実行/月
- **Pro**: $20/月（より多くのリソース）

### Heroku

- **Eco**: $5/月（スリープあり）
- **Basic**: $7/月（常時稼働）

### Supabase

- **無料枠**: 500MB データベース、50,000 行/月
- **Pro**: $25/月（より多くのリソース）

## セキュリティ考慮事項

1. **API キー**: 環境変数で管理、Git にコミットしない
2. **CORS**: 本番環境では適切なオリジンを設定
3. **データベース**: Row Level Security (RLS) の設定を検討
4. **認証**: 将来的には Supabase Auth の導入を検討
