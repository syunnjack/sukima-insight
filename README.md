# SUKIMA INSIGHT

GitHub上の全リポジトリと、公開済みWeb・PWA・iOS・Androidのアクセス、CTR、CVR、売上、改善施策を横断管理する分析SaaSです。

## 構成

- `apps/dashboard`: KPI・ファネル・リポジトリ比較・販売画面
- `services/collector`: マルチテナント収集・集計API
- `services/collector/github-sync.mjs`: GitHub全リポジトリ同期
- `packages/analytics-web`: 同意ベースのWeb計測SDK
- `docs/SYSTEM_DESIGN.md`: 販売を前提にしたシステム設計

## 開発

```bash
npm install
npm run test
npm run build
npm run api
npm run dev
```

初期開発キーは`dev-change-me`です。本番では必ず環境変数を変更してください。
