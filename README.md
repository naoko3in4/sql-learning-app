# SQL 学習支援サービス

## 概要

このアプリは SQL の理解度チェックや問題演習、AI によるフィードバックを提供する学習支援サービスです。

---

## ローカル開発環境の立ち上げ手順

### 1. 依存パッケージのインストール

```bash
cd sql-learning-app
npm install
```

### 2. 環境変数ファイルの作成

プロジェクト直下に `.env` ファイルを作成し、Claude API キーなどを設定してください。

例：

```
ANTHROPIC_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 3. サーバー（バックエンド）の起動

```bash
npm run server
```

### 4. フロントエンド（React アプリ）の起動

別のターミナルで：

```bash
npm start
```

### 5. アクセス

- フロントエンド: http://localhost:3000
- バックエンド API: http://localhost:3001

---

## 注意事項

- `.env`や`*.db`ファイルは Git 管理しないでください（`.gitignore`で除外済み）
- Claude API キーは有効なものを使用してください
- エラーが出た場合はエラーメッセージを確認し、依存パッケージや API キーの設定を見直してください

---

## ライセンス

MIT
