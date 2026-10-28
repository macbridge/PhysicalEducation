// 記録値の入力解析・表示整形・集計（DOMに依存しない純粋関数）

// 入力文字列を数値に変換する。format: "time" は「5:12.3」(分:秒) も受け付ける
export function parseValue(input, metric) {
  const s = String(input).trim().replace(/[０-９．：]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0));
  if (metric.format === "time" && s.includes(":")) {
    const m = s.match(/^(\d+):(\d{1,2}(?:\.\d+)?)$/);
    if (!m || Number(m[2]) >= 60) return NaN;
    return Number(m[1]) * 60 + Number(m[2]);
  }
  return s === "" ? NaN : Number(s);
}

// 数値を表示用文字列にする（time 形式は 312.4 → "5:12.4"）
export function formatValue(value, metric) {
  if (!Number.isFinite(value)) return "-";
  if (metric.format === "time" && value >= 60) {
    const min = Math.floor(value / 60);
    const sec = (value - min * 60).toFixed(1).padStart(4, "0");
    return `${min}:${sec}`;
  }
  return `${Math.round(value * 100) / 100}${metric.unit}`;
}

// 日付順に並べ、ベスト・最新・前回比を求める
export function summarize(records, metric) {
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date) || String(a.createdAt).localeCompare(String(b.createdAt)));
  if (!sorted.length) return { sorted, count: 0 };

  const isBetter = (a, b) => (metric.better === "lower" ? a < b : a > b);
  const best = sorted.reduce((acc, r) => (isBetter(r.value, acc.value) ? r : acc));
  const latest = sorted.at(-1);
  const previous = sorted.at(-2) ?? null;
  const diff = previous ? latest.value - previous.value : null;
  const improved = previous ? isBetter(latest.value, previous.value) : null;

  return { sorted, count: sorted.length, best, latest, previous, diff, improved };
}
