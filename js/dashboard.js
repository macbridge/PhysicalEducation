// トップページの「わたしの記録」：全領域の記録を1回で取得し、全体のまとめと各領域カードの要約を表示する
import { DOMAINS } from "./config.js";
import { api, isConnected } from "./api.js";
import { formatValue, latestByMetric } from "./records.js";
import { fitnessScores, totalScore } from "./fitness.js";
import { loadSex } from "./content/a-taitsukuri.js";
import { masteredCount } from "./content/skillcheck.js";
import { SPORTS as GYMNASTICS } from "./content/b-kikai.js";
import { SPORTS as BUDO } from "./content/f-budo.js";
import { SPORTS as BALL_GAMES } from "./content/e-kyugi.js";
import { DANCES } from "./content/g-dance.js";

const byDate = (a, b) => a.date.localeCompare(b.date) || String(a.createdAt).localeCompare(String(b.createdAt));
const lastOf = (records) => [...records].sort(byDate).at(-1);

// 記録項目（metrics）型の領域：最後に記録した項目と、記録のある項目の数
function metricSummary(records, domain) {
  const own = records.filter((r) => domain.metrics.some((m) => m.key === r.metric));
  const last = lastOf(own);
  if (!last) return null;
  const metric = domain.metrics.find((m) => m.key === last.metric);
  const done = new Set(own.map((r) => r.metric)).size;
  return { main: `${metric.label} ${formatValue(Number(last.value), metric)}`, sub: `記録した項目 ${done} / ${domain.metrics.length}` };
}

function skillSummary(records, sports) {
  if (!records.some((r) => r.metric.startsWith("skill:"))) return null;
  const { done, total } = masteredCount(records, sports);
  return { main: `できた技 ${done} / ${total}`, sub: `習得率 ${Math.round((done / total) * 100)}%` };
}

const SUMMARIES = {
  A(records, domain) {
    const sex = loadSex();
    const latest = totalScore(fitnessScores(records, sex ?? "male"), "latest");
    const minutes = records.filter((r) => r.metric === "exercise").reduce((sum, r) => sum + Number(r.value), 0);
    const sub = minutes ? `運動の実施 通算${minutes}分` : "";
    if (!latest.count) return minutes ? { main: `運動の実施 ${minutes}分`, sub: "体力テストは未記録" } : metricSummary(records, domain);
    return sex
      ? { main: `体力テスト ${latest.total}点`, sub: [`8項目中 ${latest.count}項目`, sub].filter(Boolean).join("・") }
      : { main: `体力テスト ${latest.count}項目`, sub: sub || "得点表を選ぶと合計点を表示" };
  },
  B: (records) => skillSummary(records, GYMNASTICS),
  C: metricSummary,
  D: metricSummary,
  E(records) {
    const stats = records.filter((r) => r.metric.startsWith("stat:"));
    const last = lastOf(stats);
    if (!last) return null;
    const sport = BALL_GAMES.find((s) => s.id === last.metric.split(":")[1]);
    return { main: `ゲームの記録 ${new Set(stats.map((r) => r.date)).size}日`, sub: `最新：${sport?.name ?? "—"}` };
  },
  F: (records) => skillSummary(records, BUDO),
  G(records) {
    const self = records.filter((r) => /^eval:[^:]+:self:/.test(r.metric));
    const last = lastOf(self);
    if (!last) return records.some((r) => r.metric.startsWith("eval:")) ? { main: "仲間からの評価あり", sub: "" } : null;
    const type = last.metric.split(":")[1];
    const dance = DANCES.find((d) => d.id === type);
    const sameSession = self.filter((r) => r.date === last.date && r.metric.startsWith(`eval:${type}:self:`));
    const total = [...latestByMetric(sameSession).values()].reduce((sum, r) => sum + Number(r.value), 0);
    return { main: `自己評価 ${total} / ${dance.criteria.length * 5}点`, sub: dance.name };
  },
  H(records, domain) {
    const latest = latestByMetric(records);
    if (!domain.metrics.some((m) => latest.has(m.key))) return null;
    return {
      main: `確認テスト ${domain.metrics.filter((m) => latest.has(m.key)).length} / ${domain.metrics.length}単元`,
      sub: domain.metrics.map((m, i) => `単元${i + 1} ${latest.has(m.key) ? `${latest.get(m.key).value}点` : "—"}`).join("・"),
    };
  },
};

export async function renderDashboard() {
  const panel = document.querySelector("[data-dashboard]");
  if (!panel || !isConnected()) return;
  const status = panel.querySelector("[data-dashboard-status]");
  const stats = panel.querySelector("[data-dashboard-stats]");
  panel.hidden = false;
  status.textContent = "読み込み中…";

  try {
    const records = await api.getRecords();
    const dates = [...new Set(records.map((r) => r.date))].sort();
    const active = DOMAINS.filter((d) => records.some((r) => r.domain === d.id));
    stats.innerHTML = `
      <div class="stat"><span>記録の数</span><strong>${records.length}件</strong></div>
      <div class="stat"><span>記録した日</span><strong>${dates.length}日</strong></div>
      <div class="stat"><span>最後に記録した日</span><strong>${dates.at(-1) ?? "—"}</strong></div>
      <div class="stat"><span>取り組んだ領域</span><strong>${active.length} / ${DOMAINS.length}</strong></div>`;
    status.textContent = records.length ? "" : "まだ記録がありません。領域を選んで、最初の記録をつけましょう。";

    for (const domain of DOMAINS) {
      const el = document.querySelector(`[data-domain-mine="${domain.id}"]`);
      if (!el) continue;
      const own = records.filter((r) => r.domain === domain.id);
      const summary = own.length ? SUMMARIES[domain.id](own, domain) : null;
      el.hidden = false;
      el.innerHTML = summary
        ? `<strong>${summary.main}</strong>${summary.sub ? `<small>${summary.sub}</small>` : ""}`
        : "<small>まだ記録がありません</small>";
    }
  } catch (err) {
    status.textContent = err.message;
    status.classList.add("status--error");
  }
}
