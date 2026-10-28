# HANDOFF — 作業再開用の引き継ぎ書

最終更新: 2026-10-29（Phase 3 完了・承認待ちで一時停止）

## 再開時にまず行うこと
1. このファイル → `docs/TODO.md` → `docs/ROADMAP.md` → `docs/PROJECT_PLAN.md` の順に読む。
2. `git log --oneline` と `git status` で、最後のコミット以降に変更がないか確認する。
3. ユーザーに「お願いしていた確認事項（下記）の結果」と「次の Phase に進んでよいか」を尋ねる。
   **承認を得るまで Phase 4 には着手しない。**

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
| 最終コミット | `Phase 3: swimming and physical fitness domains`（`git log` で確認） |
| 完了 Phase | Phase 0（基盤）、Phase 1 のうち実装分、Phase 2（C. 陸上競技）、Phase 3（D. 水泳 / A. 体つくり運動） |

## ユーザーの回答待ち
2026-10-29 の再開時点で 1〜3 は「まだ試していない／未確認」との回答。Phase 3 は承認を得て実施済み。
1. テスト用スプレッドシートに `gas_backend.gs` をデプロイし、設定画面で接続テスト（手順：`docs/SETUP_GUIDE.md`）
2. 学校の Google Workspace で「アクセスできるユーザー：全員」でのデプロイが可能か
3. Chromebook / iPad 実機で陸上・水泳・体つくり運動ページの表示確認（デモモードで記録入力も可）
4. 体力テスト得点表（`js/fitness.js` の `SCORE_TABLE`）が、学校で使っている文科省の得点表と一致しているか
5. Phase 4（B. 器械運動 / F. 武道 / G. ダンス）に進めてよいか

→ 1・2 で問題が出た場合は次の Phase より先に接続方式の見直し（PROJECT_PLAN §3.1 の検討事項）を優先する。

## コード構成の要点（次の領域を作るときに必要な知識）
- 8領域の定義は `js/config.js` の `DOMAINS`。記録項目は `metrics`（`better: "lower"|"higher"`、`format: "time"` で分:秒入力）。
- 領域固有のコンテンツは `content: true` を付け、`js/content/<slug>.js` に `export function render(container, domain)` を作る。
  `js/app.js` の `renderDomainPage` が動的 import する。**陸上 `c-rikujo.js`・水泳 `d-suiei.js` が見本**
  （種目タブ＋解説カード、SVG 図解アニメーション）。
- 「ねらい／ポイント／ルール」の解説カードとタブは `js/content/shared.js`（`tabbedCards` / `setupTabbedCards`）。
- 記録の追加・削除時に `document` へ `pe:records-changed` イベント（`detail.domain`）が飛ぶ。
  領域コンテンツ側で記録を集計する場合はこれを受けて再描画する（例：`a-taitsukuri.js` のレーダーチャート）。
- 体力テストの得点換算は `js/fitness.js`（純粋関数、男女別得点表）。男女の選択は端末の localStorage に保存。
- 記録の解析・整形・集計は `js/records.js`（純粋関数）。通信は `js/api.js`（GAS とデモモードを自動で切り替え）。
- グラフは `js/charts.js`（Chart.js 4.4.1、cdnjs から読み込み。タイムは y 軸を反転。`renderRadarChart` あり）。
- 各領域ページ `pages/<slug>.html` は共通テンプレート（`data-domain-page="X"` だけ違う）。
- GAS 側 API は `gas_backend.gs`（ping / getRecords / getProfile は GET、addRecord / deleteRecord / saveProfile は POST(text/plain)）。

## 検証方法（前回実施した手順）
- 構文：`node --check js/*.js js/content/*.js`（gas_backend.gs は .js にコピーしてチェック）
- 表示：スクラッチパッドで `python3 -m http.server` を起動し、デモデータを localStorage に入れるページを経由して
  ヘッドレス Chrome（`/Applications/Google Chrome.app`）でスクリーンショット。
  スマホ幅はウィンドウ幅に下限があるため、幅 390px の iframe で撮る。
- ヘッドレスでは requestAnimationFrame のアニメーションが進まないため、図解の各局面は
  モジュールを import して局面ボタンを click() するテストページで確認する。
- 公開確認：push 後に `gh api repos/macbridge/PhysicalEducation/pages/builds/latest` で反映されたコミットを確認。

## 次の Phase 4 の着手案（承認後）
「できた／まだ」のチェックリストと自己評価を記録し、習得率をグラフ化する。
- 記録の形：既存の数値記録（metric＋value）で「できた技の数」を持つか、技ごとのチェック状態を
  `saveProfile` 等で保存するかを最初に決める（GAS のシート構成に関わるため Data/API と要検討）。
- B. 器械運動：マット・鉄棒・平均台・跳び箱の技の系統図（基本技 → 発展技）と習得チェック。
- F. 武道：柔道・剣道の礼法、基本動作、技の一覧と習得チェック。
- G. ダンス：自己評価・相互評価のワークシート。
