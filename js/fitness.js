// 新体力テストの得点化（文部科学省「新体力テスト実施要項（12歳〜19歳対象）」項目別得点表）
// DOMに依存しない純粋関数

// thresholds[i] は得点 (10 - i) を取るための基準値（10点〜2点の9段階。満たさなければ1点）
// higher：基準値以上で得点 / lower：基準値以下で得点（ceil: 秒未満は切り上げて判定）
export const SCORE_TABLE = {
  male: {
    grip: { better: "higher", thresholds: [56, 51, 47, 43, 38, 33, 28, 23, 18] },
    situp: { better: "higher", thresholds: [35, 33, 30, 27, 25, 22, 19, 16, 13] },
    sitreach: { better: "higher", thresholds: [64, 58, 53, 49, 44, 39, 33, 28, 21] },
    sidestep: { better: "higher", thresholds: [63, 60, 56, 53, 49, 45, 41, 37, 30] },
    // 持久走（男子1500m）：4'59"以下=10点 … 9'20"以下=2点
    endurance: { better: "lower", ceil: true, thresholds: [299, 316, 333, 355, 382, 410, 450, 499, 560] },
    shuttle: { better: "higher", thresholds: [125, 113, 102, 90, 76, 63, 51, 37, 26] },
    dash50: { better: "lower", thresholds: [6.6, 6.8, 7.0, 7.2, 7.5, 7.9, 8.4, 9.0, 9.7] },
    standjump: { better: "higher", thresholds: [265, 254, 242, 230, 218, 203, 188, 170, 150] },
    handball: { better: "higher", thresholds: [37, 34, 31, 28, 25, 22, 19, 16, 13] },
  },
  female: {
    grip: { better: "higher", thresholds: [36, 33, 30, 28, 25, 23, 20, 17, 14] },
    situp: { better: "higher", thresholds: [29, 26, 23, 20, 18, 15, 13, 11, 8] },
    sitreach: { better: "higher", thresholds: [63, 58, 54, 50, 45, 40, 35, 30, 23] },
    sidestep: { better: "higher", thresholds: [53, 50, 48, 45, 42, 39, 36, 32, 27] },
    // 持久走（女子1000m）：3'49"以下=10点 … 6'57"以下=2点
    endurance: { better: "lower", ceil: true, thresholds: [229, 242, 259, 277, 296, 318, 342, 374, 417] },
    shuttle: { better: "higher", thresholds: [88, 76, 64, 54, 44, 35, 27, 21, 15] },
    dash50: { better: "lower", thresholds: [7.7, 8.0, 8.3, 8.6, 8.9, 9.3, 9.8, 10.3, 11.2] },
    standjump: { better: "higher", thresholds: [210, 200, 190, 179, 168, 157, 145, 132, 118] },
    handball: { better: "higher", thresholds: [23, 20, 18, 16, 14, 12, 11, 10, 8] },
  },
};

// レーダーチャートの8軸。全身持久力は持久走とシャトルランのどちらか（得点の高い方）を使う
export const FITNESS_AXES = [
  { label: "握力", keys: ["grip"] },
  { label: "上体起こし", keys: ["situp"] },
  { label: "長座体前屈", keys: ["sitreach"] },
  { label: "反復横とび", keys: ["sidestep"] },
  { label: "全身持久力", keys: ["endurance", "shuttle"] },
  { label: "50m走", keys: ["dash50"] },
  { label: "立ち幅とび", keys: ["standjump"] },
  { label: "ハンドボール投げ", chartLabel: ["ハンドボール", "投げ"], keys: ["handball"] },
];

// 1つの記録値を1〜10点に換算する
export function scoreValue(value, rule) {
  if (!Number.isFinite(value) || !rule) return null;
  const v = rule.ceil ? Math.ceil(value) : value;
  const index = rule.thresholds.findIndex((t) => (rule.better === "lower" ? v <= t : v >= t));
  return index === -1 ? 1 : 10 - index;
}

const byDate = (a, b) => a.date.localeCompare(b.date) || String(a.createdAt).localeCompare(String(b.createdAt));

// 領域Aの全記録から、軸ごとの「今回（最新）」と「前回」の得点を求める
// 戻り値: [{ label, latest: { score, record, key } | null, previous: 同 | null }, ...]
export function fitnessScores(records, sex) {
  const table = SCORE_TABLE[sex];
  const pick = (keys, offset) => {
    let best = null;
    for (const key of keys) {
      const list = records.filter((r) => r.metric === key).sort(byDate);
      const record = list.at(-1 - offset);
      if (!record) continue;
      const score = scoreValue(Number(record.value), table[key]);
      if (!best || score > best.score) best = { score, record, key };
    }
    return best;
  };
  return FITNESS_AXES.map((axis) => ({ label: axis.label, chartLabel: axis.chartLabel ?? axis.label, latest: pick(axis.keys, 0), previous: pick(axis.keys, 1) }));
}

// 合計点（記録のある軸だけを合計し、件数も返す）
export function totalScore(axes, which) {
  const scored = axes.map((a) => a[which]).filter(Boolean);
  return { total: scored.reduce((sum, s) => sum + s.score, 0), count: scored.length };
}
