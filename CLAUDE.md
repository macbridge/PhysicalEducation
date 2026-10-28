# CLAUDE.md — PhysicalEducation

高校体育（学習指導要領 A〜H 全8領域）の学習・記録Webプラットフォーム。静的 HTML/CSS/JS ＋ Chart.js、GitHub Pages で公開し、GAS 経由で生徒個人のスプレッドシートに保存する。

## 作業を再開するときは
**最初に `docs/HANDOFF.md` を読むこと。** 進捗、ユーザーへの確認待ち事項、次にやることがまとめてある。
その後 `docs/TODO.md` / `docs/ROADMAP.md` を更新しながら進める。

## このプロジェクトのルール
- PM として4エージェント（PM / Frontend / Data/API / PE Content）の役割を切り替えて進める（定義：`docs/PROJECT_PLAN.md`）。
- 各 Phase の完了時に報告し、ユーザーの承認を得てから次の Phase へ進む。
- ビルド工程なし。npm 等の依存を追加しない。外部ライブラリは CDN からバージョン固定で読み込む。
- 区切りごとに `docs/TODO.md`・`docs/ROADMAP.md`・`docs/HANDOFF.md` を更新し、コミットして push する（push すると GitHub Pages に反映される）。
