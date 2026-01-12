# CLAUDE.md

## プロジェクト概要

pay4words.com上でエージェントを実行するプロジェクト。SPAからエージェントを実行し、結果を表示する。

## アーキテクチャ

```
[SPA] https://pay4words.com/agents/
    ↓ POST /api/agents/run
[pay4words-api]
    ↓ 1min.ai API
[1min.ai] gpt-5-nano 等
    ↓ レスポンス
[pay4words-api]
    ↓ GET /api/agents/status/{run_id}
[SPA] 結果表示
```

## SPA

**URL:** https://pay4words.com/agents/

**技術スタック:**
- Vite + Vue 3 + TypeScript
- shadcn-vue (UIコンポーネント)
- Tailwind CSS

**ビルド & デプロイ:**
```bash
cd spa
npm run build
scp -r dist/* root@pay4words.com:/root/pay4words-web/.output/public/agents/
```

## エージェント実行API

### POST /api/agents/run

エージェント実行を開始。

```json
{
  "prompt": "Say hello in Japanese",
  "model": "gpt-5-nano"
}
```

レスポンス:
```json
{
  "success": true,
  "run_id": "uuid",
  "message": "Agent execution started"
}
```

### GET /api/agents/status/{run_id}

実行状態を取得。

```json
{
  "success": true,
  "run_id": "uuid",
  "status": "completed",  // queued, in_progress, completed, failure
  "steps": [
    {"name": "Initialize", "status": "completed"},
    {"name": "Run Agent", "status": "completed"}
  ],
  "result": "こんにちは",
  "error": null
}
```

### GET /api/agents/runs

実行履歴一覧。

## OpenAI互換エンドポイント

**Base URL:** `https://pay4words.com/v1`

| パス | メソッド | 説明 |
|------|----------|------|
| `/v1/models` | GET | 利用可能なモデル一覧 |
| `/v1/chat/completions` | POST | チャット補完 |

### 利用可能なモデル

- `gpt-5-nano` - GPT-5 Nano（軽量・高速）
- `gpt-4o` / `gpt-4o-mini` - GPT-4o系
- `claude-sonnet-4-20250514` / `claude-3-5-haiku-20241022` - Claude系
- `gemini-2.0-flash-lite` / `gemini-2.5-flash` - Gemini系
- `deepseek-chat` / `deepseek-reasoner` - DeepSeek系

## 画像解析（未実装）

1min.aiは画像解析に対応しているが、現在のエンドポイントは未対応。

- `gpt-4o` - 画像解析対応
- `gpt-5-nano` - **画像非対応**（テキストのみ）

### 1min.aiでの画像解析手順

```
1. POST /api/assets で画像をアップロード
   → fileContent.path を取得

2. POST /api/features で CHAT_WITH_IMAGE
   → imageList に path を渡す
```

## Self-hosted Runner（参考）

GitHub Actionsを多用する場合、Self-hosted Runnerで定額使い放題にできる。

```bash
# サーバーにrunnerをインストール
mkdir -p actions-runner && cd actions-runner
curl -o actions-runner-linux-x64.tar.gz -L https://github.com/actions/runner/releases/download/v2.321.0/actions-runner-linux-x64-2.321.0.tar.gz
tar xzf ./actions-runner-linux-x64.tar.gz
./config.sh --url https://github.com/OWNER/REPO --token TOKEN
./svc.sh install && ./svc.sh start
```

**メリット:**
- GitHub-hosted Runnerの無料枠を気にしなくていい
- 環境が保持されるので起動が速い（3-5秒）

## 関連リポジトリ

- [pay4words-api](https://github.com/tomohiro-owada/pay4words-api) - OpenAI互換ラッパーAPI
