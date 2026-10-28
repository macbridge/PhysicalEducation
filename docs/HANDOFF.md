# HANDOFF — 作業再開用の引き継ぎ書

最終更新: 2026-10-29（Phase 2 完了時点で一時停止）

## 再開時にまず行うこと
1. このファイル → `docs/TODO.md` → `docs/ROADMAP.md` → `docs/PROJECT_PLAN.md` の順に読む。
2. `git log --oneline` と `git status` で、最後のコミット以降に変更がないか確認する。
3. ユーザーに「お願いしていた確認事項（下記）の結果」と「次の Phase に進んでよいか」を尋ねる。
   **承認を得るまで Phase 3 には着手しない。**

## ユーザーから与えられた役割・進め方
- 役割：PM 兼マスターAIエージェント。PM / Frontend / Data/API / PE Content の4エージェントを
  自分の思考内でロールプレイして進める（サブエージェントは起動しない）。役割定義は `docs/PROJECT_PLAN.md` §4。
- 各 Phase の完了時に、成果物の概要と次のタスクを報告し、**承認を求めてから**次へ進む。
- 応答は日本語。ファイル削除はしない（必要ならゴミ箱へ）。`/Users/bigbridge/Developar` の外へは書き込まない。

## 現在の状態
| 項目 | 状態 |
|---|---|
| ローカル | `/Users/bigbridge/Developar/Project/PhysicalEducation`（旧名 FisicalEducation から変更済み） |
| GitHub | https://github.com/macbridge/PhysicalEducation（Public、`main` ブランチ） |
| 公開サイト | https://macbridge.github.io/PhysicalEducation/（GitHub Pages：main / ルート） |
| 最終コミット | `Phase 1/2: setup guide, demo mode, athletics prototype`（df4e0b3）＋ 本引き継ぎ書のコミット |
| 完了 Phase | Phase 0（基盤）、Phase 1 のうち実装分、Phase 2（C. 陸上競技プロトタイプ） |

## ユーザーの回答待ち（前回の報告で依頼済み）
1. テスト用スプレッドシートに `gas_backend.gs` をデプロイし、設定画面で接続テスト（手順：`docs/SETUP_GUIDE.md`）
2. 学校の Google Workspace で「アクセスできるユーザー：全員」でのデプロイが可能か
3. Chromebook / iPad 実機で陸上競技ページの表示確認（デモモードで記録入力も可）
4. Phase 3（D. 水泳 / A. 体つくり運動）に進めてよいか

→ 1・2 で問題が出た場合は Phase 3 より先に接続方式の見直し（PROJECT_PLAN §3.1 の検討事項）を優先する。

## コード構成の要点（次の領域を作るときに必要な知識）
- 8領域の定義は `js/config.js` の `DOMAINS`。記録項目は `metrics`（`better: "lower"|"higher"`、`format: "time"` で分:秒入力）。
- 領域固有のコンテンツは `content: true` を付け、`js/content/<slug>.js` に `export function render(container, domain)` を作る。
  `js/app.js` の `renderDomainPage` が動的 import する。**陸上の `js/content/c-rikujo.js` が見本**
  （種目タブ＋解説カード、SVG 図解アニメーション）。
- 記録の解析・整形・集計は `js/records.js`（純粋関数）。通信は `js/api.js`（GAS とデモモードを自動で切り替え）。
- グラフは `js/charts.js`（Chart.js 4.4.1、cdnjs から読み込み。タイムは y 軸を反転）。
- 各領域ページ `pages/<slug>.html` は共通テンプレート（`data-domain-page="X"` だけ違う）。
- GAS 側 API は `gas_backend.gs`（ping / getRecords / getProfile は GET、addRecord / deleteRecord / saveProfile は POST(text/plain)）。

## 検証方法（前回実施した手順）
- 構文：`node --check js/*.js js/content/*.js`（gas_backend.gs は .js にコピーしてチェック）
- 表示：スクラッチパッドで `python3 -m http.server` を起動し、デモデータを localStorage に入れるページを経由して
  ヘッドレス Chrome（`/Applications/Google Chrome.app`）でスクリーンショット。
  スマホ幅はウィンドウ幅に下限があるため、幅 390px の iframe で撮る。
- 公開確認：push 後に `gh api repos/macbridge/PhysicalEducation/pages/builds/latest` で反映されたコミットを確認。

## 次の Phase 3 の着手案（承認後）
- D. 水泳：`js/content/d-suiei.js` を作成（泳法別の技能ポイント・ルール、クロールのストローク図解）。
  記録項目に背泳ぎ・バタフライ・長く泳ぐ（距離 m）を追加。
- A. 体つくり運動：体力テスト全項目の記録と、レーダーチャートで前回と比較（`js/charts.js` に関数を追加）。
