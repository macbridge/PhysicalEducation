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
        fill: true,
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
