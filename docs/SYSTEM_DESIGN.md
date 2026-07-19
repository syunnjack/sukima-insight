# SUKIMA INSIGHT システム設計

## 目的

GitHub Appを導入した個人・組織の全リポジトリを台帳化し、各Web、PWA、iOS、Androidから送られる匿名イベントと成果データを同じKPIで比較する。対象件数を30件に固定しない。

## 構成

```text
GitHub App ─→ repository sync ─→ projects
Web/Expo SDK ─→ collector API ─→ raw events
ASP/決済 ─→ conversion import ─→ conversions
raw events ─→ daily aggregation ─→ dashboard / report / alerts
```

## KPI

- アクセス数: 日次匿名セッション
- PV: `page_view`
- CTR: `affiliate_click / offer_impression`
- CVR: `conversion / affiliate_click`
- 売上: 承認済み成果金額（MVPは受信値）
- RPS: `revenue / sessions`
- AI準備開始率・完了率
- 通知登録率・通知経由成果
- プロジェクト、アプリ、配置、施策、実験variant別成果
- エラー率、継続率、通知解除率をガードレールにする

GitHub Trafficのview/cloneと、サイトのアクセス数は別指標として扱う。

## マルチテナント

全レコードへ`workspace_id`を持たせ、管理キー、プロジェクト書込キー、料金プラン、保持期間を顧客単位で分離する。販売版ではPostgreSQLのRow Level Security、暗号化された秘密情報、監査ログ、管理者MFAを追加する。

## GitHub同期

MVPは`github-sync.mjs`で100件ずつページングする。販売版はGitHub App installation tokenを利用し、repository・installation webhookで追加、移管、削除、非公開化へ追従する。Contentsの書込権限は要求しない。

## プライバシー

- 分析同意がある場合だけSDKが送信
- IPアドレスをDBへ保存しない
- セッションIDは日付・秘密saltとともにハッシュ化
- パスポート、カード、正確な位置、健康情報を禁止
- 成人向けの具体的嗜好を属性に含めない
- 生イベント90日、日次集計25か月を初期方針とする

## 販売段階

1. 自社リポジトリで実証
2. Starter: 3プロジェクト
3. Growth: 30プロジェクト、収益、実験
4. Agency: 複数顧客、ホワイトラベル
5. Enterprise: 全リポジトリ、SSO、監査、SLA

課金軸は計測プロジェクト数と月間イベント数。GitHub台帳へ登録されただけの未計測リポジトリは課金対象にしない。
