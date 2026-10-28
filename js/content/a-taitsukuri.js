// A. 体つくり運動 — 領域固有の学習コンテンツ（学習内容の解説 ＋ 体力テストの得点とレーダーチャート）
// ねらいは高等学校学習指導要領解説（保健体育編）の内容に基づく
import { tabbedCards, setupTabbedCards } from "./shared.js";
import { api, isConnected } from "../api.js";
import { renderRadarChart } from "../charts.js";
import { fitnessScores, totalScore } from "../fitness.js";
import { formatValue } from "../records.js";

const TOPICS = [
  {
    name: "体ほぐしの運動",
    aim: "手軽な運動を行い、心と体は互いに影響し変化することや心身の状態に気付き、仲間と自主的に関わり合うこと。",
    points: [
      "勝ち負けや記録ではなく、運動したときの心や体の変化（楽しい・すっきりした・温かくなった）に目を向ける。",
      "ペアやグループで、相手の動きや気持ちに合わせて運動する。",
      "運動の前後で「心と体の状態」をふり返り、気付いたことをメモに残す。",
    ],
    rules: [
      "ペアストレッチ・リズムに合わせたジャンプやステップ",
      "ボールや新聞紙・タオルなどの用具を使った運動",
      "仲間と協力して行う運動（手をつないで輪くぐり、人間知恵の輪 など）",
      "呼吸を整えながら行うストレッチや脱力の運動",
    ],
  },
  {
    name: "実生活に生かす運動の計画",
    aim: "自己のねらいに応じて、健康の保持増進や調和のとれた体力の向上を図るための継続的な運動の計画を立て取り組むこと。",
    points: [
      "ねらいを決める：「健康に生活するための体力」か「運動を行うための体力」か。",
      "体力テストの結果（下のレーダーチャート）から、伸ばしたい体力を見つける。",
      "運動の種類・強さ・時間・回数・期間を決め、無理なく続けられる計画にする。",
      "実施した時間を「運動の実施時間」に記録し、1〜2週間ごとに計画を見直す。",
    ],
    rules: [
      "全身持久力を高めたい → ややきついと感じる速さのジョギング 20分 × 週3回",
      "筋力を高めたい → 腕立て伏せ・スクワット・上体起こし 各10回 × 3セット",
      "柔軟性を高めたい → 入浴後のストレッチ 10分 × 毎日",
      "敏捷性を高めたい → ラダーやサイドステップ 30秒 × 5セット",
    ],
    safety: "運動の前後にはウォーミングアップとクールダウンを行い、痛みや体調不良があるときは休む。",
  },
];
const CARD_OPTIONS = { pointsTitle: "学習のポイント", rulesTitle: "運動の例" };

const SEX_KEY = "pe-platform:fitness-sex";
export const loadSex = () => {
  try {
    return localStorage.getItem(SEX_KEY);
  } catch {
    return null;
  }
};
const saveSex = (sex) => {
  try {
    localStorage.setItem(SEX_KEY, sex);
  } catch {
    // 保存できない環境では、ページを開くたびに選び直してもらう
  }
};

function fitnessPanel() {
  return `
    <section class="panel" data-fitness>
      <h2>体力テストの得点（前回との比較）</h2>
      <fieldset class="segmented">
        <legend>使う得点表</legend>
        <label><input type="radio" name="sex" value="male"> 男子</label>
        <label><input type="radio" name="sex" value="female"> 女子</label>
      </fieldset>
      <p class="status" data-fitness-status role="status"></p>
      <div data-fitness-result hidden>
        <div class="stats" data-fitness-total></div>
        <div class="chart-box chart-box--radar"><canvas data-radar aria-label="体力テスト8項目の得点（今回と前回）のレーダーチャート"></canvas></div>
        <div class="table-scroll">
          <table class="score-table" data-score-table></table>
        </div>
      </div>
      <p class="note">得点は文部科学省「新体力テスト」項目別得点表（12〜19歳）で1〜10点に換算しています。全身持久力は持久走（男子1500m・女子1000m）と20mシャトルランのうち得点の高い方を使います。</p>
    </section>`;
}

function setupFitnessPanel(panel, domain) {
  const status = panel.querySelector("[data-fitness-status]");
  const result = panel.querySelector("[data-fitness-result]");
  const canvas = panel.querySelector("[data-radar]");
  const totals = panel.querySelector("[data-fitness-total]");
  const table = panel.querySelector("[data-score-table]");
  const metricOf = (key) => domain.metrics.find((m) => m.key === key);
  let sex = loadSex();

  const setStatus = (msg, isError = false) => {
    status.textContent = msg;
    status.classList.toggle("status--error", isError);
  };

  const cell = (entry) => (entry ? `${formatValue(Number(entry.record.value), metricOf(entry.key))}<small>${entry.record.date}</small>` : "—");
  const score = (entry) => (entry ? `${entry.score}点` : "—");

  async function load() {
    result.hidden = true;
    if (!sex) return setStatus("得点表（男子・女子）を選ぶと、得点とレーダーチャートが表示されます。");
    if (!isConnected()) return setStatus("記録を表示するには「設定」でスプレッドシートと接続してください。");
    setStatus("読み込み中…");
    try {
      const records = await api.getRecords(domain.id);
      const axes = fitnessScores(records, sex);
      const latest = totalScore(axes, "latest");
      if (!latest.count) return setStatus("体力テストの記録がまだありません。下の「記録とふり返り」で項目ごとに入力しましょう。");
      const previous = totalScore(axes, "previous");

      totals.innerHTML = `
        <div class="stat"><span>今回の合計</span><strong>${latest.total}点</strong><small>8項目中 ${latest.count}項目</small></div>
        <div class="stat"><span>前回の合計</span><strong>${previous.count ? `${previous.total}点` : "—"}</strong><small>${previous.count ? `8項目中 ${previous.count}項目` : "2回目の記録から表示"}</small></div>`;
      table.innerHTML = `
        <thead><tr><th>項目</th><th>今回の記録</th><th>得点</th><th>前回</th></tr></thead>
        <tbody>${axes.map((a) => `
          <tr><th scope="row">${a.label}</th><td>${cell(a.latest)}</td><td>${score(a.latest)}</td><td>${score(a.previous)}</td></tr>`).join("")}
        </tbody>`;

      const color = getComputedStyle(document.documentElement).getPropertyValue("--muted").trim();
      const datasets = [{ label: "今回", data: axes.map((a) => a.latest?.score ?? null), color: domain.color }];
      if (previous.count) datasets.push({ label: "前回", data: axes.map((a) => a.previous?.score ?? null), color, dashed: true });
      result.hidden = false;
      renderRadarChart(canvas, axes.map((a) => a.chartLabel), datasets);
      setStatus(latest.count < 8 ? "まだ記録のない項目があります。すべて入力すると合計点を比べやすくなります。" : "");
    } catch (err) {
      setStatus(err.message, true);
    }
  }

  panel.querySelectorAll("input[name=sex]").forEach((input) => {
    input.checked = input.value === sex;
    input.addEventListener("change", () => {
      sex = input.value;
      saveSex(sex);
      load();
    });
  });
  document.addEventListener("pe:records-changed", (e) => e.detail.domain === domain.id && load());

  load();
}

export function render(container, domain) {
  container.innerHTML = `
    ${tabbedCards("学習する内容のポイント", TOPICS, CARD_OPTIONS)}
    ${fitnessPanel()}`;

  setupTabbedCards(container.querySelector("[data-tabbed-cards]"), TOPICS, CARD_OPTIONS);
  setupFitnessPanel(container.querySelector("[data-fitness]"), domain);
}
