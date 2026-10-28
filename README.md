# 体育ラーニング（PhysicalEducation）

高等学校「体育」の学習指導要領 全8領域（A〜H）を学び、記録し、グラフでふり返る Web プラットフォーム。

- ホスティング: GitHub Pages（静的サイト、ビルド不要）
- データ保存: 生徒個人の Google スプレッドシート（`gas_backend.gs` を GAS の Web アプリとしてデプロイ）
- グラフ: Chart.js 4.4.1（CDN）

## ローカルで確認する

ES Modules を使うため、`file://` で直接開くのではなくローカルサーバーで表示する。

```sh
cd PhysicalEducation
python3 -m http.server 8000
# → http://localhost:8000/
```

## ドキュメント

- [docs/PROJECT_PLAN.md](docs/PROJECT_PLAN.md) — 要件・構成・エージェント役割
- [docs/ROADMAP.md](docs/ROADMAP.md) — 開発ロードマップ
- [docs/TODO.md](docs/TODO.md) — タスク・進捗
- [gas_backend.gs](gas_backend.gs) — GAS 側 API（冒頭コメントに設置手順あり）
