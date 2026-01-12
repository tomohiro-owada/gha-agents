# CLAUDE.md

## プロジェクト概要

GitHub ActionsでOpenAI Agents SDKを使い、1min.aiのモデル（gpt-5-nano等）を実行するプロジェクト。

## アーキテクチャ

```
GitHub Actions
    ↓ OpenAI形式リクエスト
https://pay4words.com/v1/chat/completions
    ↓ 1min.ai形式に変換
https://api.1min.ai/api/features
    ↓ レスポンス
pay4words.com（OpenAI形式に変換）
    ↓
GitHub Actions
```

## OpenAI互換エンドポイント

**Base URL:** `https://pay4words.com/v1`

### エンドポイント

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

## 使い方

### OpenAI SDK

```python
from openai import OpenAI

client = OpenAI(
    base_url="https://pay4words.com/v1",
    api_key="dummy"  # 認証はサーバー側で処理
)

response = client.chat.completions.create(
    model="gpt-5-nano",
    messages=[{"role": "user", "content": "Hello"}]
)
print(response.choices[0].message.content)
```

### OpenAI Agents SDK

```python
from agents import Agent, Runner

agent = Agent(
    name="assistant",
    model="gpt-5-nano",
    instructions="You are a helpful assistant."
)

# base_urlの設定方法はAgents SDKのドキュメント参照
```

## GitHub Actions設定

```yaml
name: Run Agent
on:
  workflow_dispatch:

jobs:
  run:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install openai
      - run: python agent.py
        env:
          OPENAI_BASE_URL: https://pay4words.com/v1
          OPENAI_API_KEY: dummy
```

## 関連リポジトリ

- [pay4words-api](https://github.com/tomohiro-owada/pay4words-api) - OpenAI互換ラッパーAPI

## 画像解析（未実装）

1min.aiは画像解析に対応しているが、現在のpay4words.comエンドポイントは未対応。

### 対応モデル

- `gpt-4o` - 画像解析対応
- `gpt-5-nano` - **画像非対応**（テキストのみ）

### 1min.aiでの画像解析手順

```
1. POST /api/assets で画像をアップロード
   → fileContent.path を取得

2. POST /api/features で CHAT_WITH_IMAGE
   → imageList に path を渡す
```

### 実装例（1min.ai直接）

```python
import requests

API_KEY = "your_1min_api_key"

# Step 1: 画像アップロード
with open("image.png", "rb") as f:
    upload = requests.post(
        "https://api.1min.ai/api/assets",
        headers={"API-KEY": API_KEY},
        files={"asset": f}
    )
file_path = upload.json()["fileContent"]["path"]

# Step 2: 画像解析
response = requests.post(
    "https://api.1min.ai/api/features",
    headers={"API-KEY": API_KEY, "Content-Type": "application/json"},
    json={
        "type": "CHAT_WITH_IMAGE",
        "model": "gpt-4o",
        "promptObject": {
            "prompt": "What is in this image?",
            "imageList": [file_path]
        }
    }
)
result = response.json()["aiRecord"]["aiRecordDetail"]["resultObject"][0]
```

### TODO

pay4words.comエンドポイントでOpenAI形式の画像メッセージ（base64/URL）を受け取り、1min.aiにアップロード→pathで渡す変換処理を実装する。

## 注意事項

- 認証はpay4words.comサーバー側の`ONEMIN_API_KEY`環境変数で行われる
- レートリミットは1min.aiの制限に依存
- トークン使用量は概算値（1min.aiが正確な値を返さない場合あり）
