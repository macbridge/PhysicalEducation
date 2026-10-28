# HANDOFF — 作業再開用の引き継ぎ書

最終更新: 2026-10-29（Phase 5 完了・承認待ちで一時停止）

## 再開時にまず行うこと
1. このファイル → `docs/TODO.md` → `docs/ROADMAP.md` → `docs/PROJECT_PLAN.md` の順に読む。
2. `git log --oneline` と `git status` で、最後のコミット以降に変更がないか確認する。
3. ユーザーに「お願いしていた確認事項（下記）の結果」と「次の Phase に進んでよいか」を尋ねる。
   **承認を得るまで Phase 6 には着手しない。**

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
| 最終コミット | `Phase 5: ball games and PE theory domains`（`git log` で確認） |
| 完了 Phase | Phase 0（基盤）、Phase 1 のうち実装分、Phase 2〜5（A〜H 全8領域の実装済み） |

## ユーザーの回答待ち
2026-10-29 の再開時点で 1〜3 は「まだ試していない／未確認」との回答。Phase 3〜5 は承認を得て実施済み。
1. テスト用スプレッドシートに `gas_backend.gs` をデプロイし、設定画面で接続テスト（手順：`docs/SETUP_GUIDE.md`）
2. 学校の Google Workspace で「アクセスできるユーザー：全員」でのデプロイが可能か
3. Chromebook / iPad 実機で陸上・水泳・体つくり運動ページの表示確認（デモモードで記録入力も可）
4. 体力テスト得点表（`js/fitness.js` の `SCORE_TABLE`）が、学校で使っている文科省の得点表と一致しているか
5. 器械運動・武道の技の一覧、ダンスの評価観点が授業の内容と合っているか
6. 球技のスタッツ項目、体育理論の解説・テスト問題が授業（教科書）と合っているか
7. Phase 6（ダッシュボード・仕上げ）に進めてよいか

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
- `metrics: []` の領域（B / F / G）は共通の「記録とふり返り」パネルを出さず、記録は領域コンテンツ側で扱う。
- チェックリスト・評価型の保存形式（GAS 変更なし。Records に1操作1行、metric ごとの最新行が現在の状態）：
  - 技の習得：`metric = "skill:<種目>:<技名>"`、`value = 0 まだ / 1 練習中 / 2 できた`（`js/content/skillcheck.js`）
  - ダンス評価：`metric = "eval:<sosaku|folk|rhythm>:<self|peer>:<観点番号>"`、`value = 1〜5`、
    同じ日付×評価者を1回の評価として扱い、コメントは観点1の行の memo（`js/content/g-dance.js`）
  - 球技スタッツ：`metric = "stat:<種目id>:<項目key>"`、その日のゲームの合計。同じ日付で保存し直すと項目ごとに上書き。
    ゲームの自己評価は `stat:<種目id>:selfeval`（1〜5）で、ふり返りはその行の memo（`js/content/e-kyugi.js`）
  - 体育理論：テストの得点（100点満点）は通常の記録項目 `unit1`〜`unit3` に保存（`js/content/h-riron.js`）
  - 技名や観点・項目 key を変えると過去の記録と結び付かなくなるので、変更時は注意する。
- `pe:records-changed` の `detail.source` が `"panel"` 以外（例：体育理論のテスト）のときは、
  共通の「記録とふり返り」パネルが `detail.metric` のタブに切り替えて読み直す。
- 作戦ボードは `js/content/board.js`（コート図は viewBox 600×360、左右対称のコートは左半分を反転して描画）。
- 共通ヘルパー：`records.js` の `latestByMetric` / `countOverTime` / `today`、`charts.js` の `renderLinesChart`（複数系列）。
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
- 操作のテストは、同一オリジンの iframe でページを開いてボタンを click() し、結果を `--dump-dom` で読む。
- シード用の HTML には必ず `<meta charset="utf-8">` を付ける（無いと日本語の metric が文字化けする）。
- 公開確認：push 後に `gh api repos/macbridge/PhysicalEducation/pages/builds/latest` で反映されたコミットを確認。

## 次の Phase 6 の着手案（承認後）
- ダッシュボード（トップページまたは専用ページ）：全領域の記録を1回の `getRecords()`（domain 指定なし）で取得し、
  領域ごとの最新記録・記録回数・習得率などをカードで一覧表示する。
- アクセシビリティ・パフォーマンス：キーボード操作、タブの role/aria の整理、ライト/ダーク両方のコントラスト確認、
  Chart.js を使わないページでは読み込まない等。
- 教員向けマニュアル（`docs/TEACHER_GUIDE.md`）：テンプレートシートの配布、生徒の初期設定、シートの見方（metric の意味）。
- 必要に応じて：運動計画ワークシート（A）、ダンス作品づくりシート（G）、作戦ボードの保存（E）。
