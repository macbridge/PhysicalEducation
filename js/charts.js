// Chart.js のラッパー（Chart はページ側で CDN から読み込み、window.Chart として利用）
const instances = new WeakMap();

// 記録の推移を折れ線グラフで描画する
// records: [{ date: "2026-10-29", value: 13.2 }, ...]
export function renderTrendChart(canvas, records, { label, unit, color, better }) {
  instances.get(canvas)?.destroy();

  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
  const chart = new window.Chart(canvas, {
    type: "line",
    data: {
      labels: sorted.map((r) => r.date),
      datasets: [{
        label: `${label}（${unit}）`,
        data: sorted.map((r) => r.value),
        borderColor: color,
        backgroundColor: color + "33",
        pointRadius: 5,
        tension: 0.25,
        fill: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        // タイム系は小さいほど良いので軸を反転し、「上がる＝伸びた」に揃える
        y: { reverse: better === "lower", title: { display: true, text: unit } },
      },
      plugins: { legend: { display: false } },
    },
  });
  instances.set(canvas, chart);
  return chart;
}

// 体力テストの得点（1〜10点）をレーダーチャートで描画する
// datasets: [{ label: "今回", data: [7, 5, null, ...], color: "#e8590c" }, ...]（null は未測定）
// max / step で目盛りを変えられる（ダンスの評価は 1〜5 点）
export function renderRadarChart(canvas, labels, datasets, { max = 10, step = 2 } = {}) {
  instances.get(canvas)?.destroy();

  const css = getComputedStyle(document.documentElement);
  const grid = css.getPropertyValue("--border").trim();
  const text = css.getPropertyValue("--muted").trim();
  const chart = new window.Chart(canvas, {
    type: "radar",
    data: {
      labels,
      datasets: datasets.map(({ label, data, color, dashed }) => ({
        label,
        data,
        borderColor: color,
        backgroundColor: color + "26",
        borderWidth: 2,
        borderDash: dashed ? [6, 4] : [],
        pointBackgroundColor: color,
        pointRadius: 4,
        pointHoverRadius: 6,
        spanGaps: true,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          min: 0, max,
          ticks: { stepSize: step, backdropColor: "transparent", color: text },
          grid: { color: grid },
          angleLines: { color: grid },
          // スマホ幅では項目名を小さくして、チャート本体の面積を確保する
          pointLabels: { color: text, padding: 6, font: (c) => ({ size: c.chart.width < 500 ? 11 : 13 }) },
        },
      },
      plugins: {
        legend: { position: "bottom", labels: { color: text } },
        tooltip: { callbacks: { label: (c) => `${c.dataset.label}：${c.raw ?? "未測定"}点` } },
      },
    },
  });
  instances.set(canvas, chart);
  return chart;
}

// 複数系列の推移を折れ線グラフで描画する（例：自己評価と仲間からの評価の合計点）
// labels: 日付の配列 / datasets: [{ label, data: [数値 | null, ...], color, dashed }]
// 系列が1本のときは legend: false にして凡例を出さない（見出しで何のグラフか分かるため）
export function renderLinesChart(canvas, labels, datasets, { unit, min, max, legend = true } = {}) {
  instances.get(canvas)?.destroy();

  const text = getComputedStyle(document.documentElement).getPropertyValue("--muted").trim();
  const chart = new window.Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: datasets.map(({ label, data, color, dashed }) => ({
        label,
        data,
        borderColor: color,
        backgroundColor: color,
        borderWidth: 2,
        borderDash: dashed ? [6, 4] : [],
        pointRadius: 5,
        tension: 0.25,
        spanGaps: true,
      })),
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      scales: { y: { min, max, ticks: { stepSize: 1 }, title: { display: Boolean(unit), text: unit } } },
      plugins: { legend: { display: legend, position: "bottom", labels: { color: text } } },
    },
  });
  instances.set(canvas, chart);
  return chart;
}
