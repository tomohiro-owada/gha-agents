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

## 注意事項

- 認証はpay4words.comサーバー側の`ONEMIN_API_KEY`環境変数で行われる
- レートリミットは1min.aiの制限に依存
- トークン使用量は概算値（1min.aiが正確な値を返さない場合あり）
