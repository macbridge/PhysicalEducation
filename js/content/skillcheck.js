// 技の系統図＋習得チェック（B. 器械運動・F. 武道で共通）
// 1回のチェックを Records に1行（metric: "skill:<種目>:<技>", value: 0=まだ / 1=練習中 / 2=できた）として追加し、
// 技ごとの最新の行を現在の状態とする。履歴が残るので「できた技の数」の推移をグラフにできる
import { infoCard } from "./shared.js";
import { api, isConnected } from "../api.js";
import { renderLinesChart } from "../charts.js";
import { latestByMetric, countOverTime, today } from "../records.js";

const LEVELS = ["まだ", "練習中", "できた"];
const MASTERED = 2;

const skillMetric = (sport, skill) => `skill:${sport.short}:${skill}`;
const sportMetrics = (sport) => sport.groups.flatMap((g) => g.skills.map((s) => skillMetric(sport, s)));

function sportPanel(sport, options) {
  return `
    <article class="event-card">${infoCard(sport, options)}</article>
    <h3 class="skill-heading">技の系統とチェック</h3>
    <p class="note">技をタップするたびに「まだ → 練習中 → できた」と切り替わり、その日の記録として保存されます。左から右へ、基本の技から発展の技の順に並んでいます。</p>
    ${sport.groups.map((g) => `
      <div class="skill-group">
        <h4>${g.name}</h4>
        <ol class="skill-chain">
          ${g.skills.map((s) => `<li><button type="button" class="skill" data-skill="${skillMetric(sport, s)}" data-name="${s}">${s}<small></small></button></li>`).join("")}
        </ol>
      </div>`).join("")}`;
}

// sports: [{ name, short, aim, points, rules, safety?, groups: [{ name, skills: ["前転", ...] }] }]
export function renderSkillCheck(container, domain, sports, { title, options } = {}) {
  container.innerHTML = `
    <section class="panel">
      <h2>${title}</h2>
      <div class="metric-tabs" role="tablist">
        ${sports.map((s, i) => `<button role="tab" data-sport-tab="${i}" aria-selected="${i === 0}">${s.name}</button>`).join("")}
      </div>
      <div data-sport-panel>${sportPanel(sports[0], options)}</div>
      <p class="status" data-skill-status role="status"></p>
    </section>
    <section class="panel">
      <h2>習得状況</h2>
      <div class="stats" data-skill-stats></div>
      <div class="chart-box" data-skill-chart-box hidden><canvas data-skill-chart aria-label="できた技の数の推移グラフ"></canvas></div>
    </section>`;

  const status = container.querySelector("[data-skill-status]");
  const stats = container.querySelector("[data-skill-stats]");
  const chartBox = container.querySelector("[data-skill-chart-box]");
  const canvas = container.querySelector("[data-skill-chart]");
  const sportBox = container.querySelector("[data-sport-panel]");
  const allMetrics = new Set(sports.flatMap(sportMetrics));
  let records = [];
  let loaded = false;

  const setStatus = (msg, isError = false) => {
    status.textContent = msg;
    status.classList.toggle("status--error", isError);
  };

  const levelOf = (latest, metric) => Number(latest.get(metric)?.value ?? 0);

  function paintSkills() {
    const latest = latestByMetric(records);
    sportBox.querySelectorAll("[data-skill]").forEach((btn) => {
      const level = levelOf(latest, btn.dataset.skill);
      btn.dataset.level = level;
      btn.querySelector("small").textContent = LEVELS[level];
      btn.setAttribute("aria-label", `${btn.dataset.name}：${LEVELS[level]}（タップで変更）`);
    });
  }

  function paintSummary() {
    const latest = latestByMetric(records);
    const count = (metrics) => metrics.filter((m) => levelOf(latest, m) === MASTERED).length;
    const tile = (label, done, total) => `
      <div class="stat"><span>${label}</span><strong>${done} / ${total}</strong>
        <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${done}"><span style="width:${(done / total) * 100}%"></span></div>
      </div>`;
    stats.innerHTML = tile("できた技（全体）", count([...allMetrics]), allMetrics.size)
      + sports.map((s) => tile(s.name, count(sportMetrics(s)), sportMetrics(s).length)).join("");

    const trend = countOverTime(records, MASTERED);
    chartBox.hidden = trend.length < 1;
    if (trend.length) {
      renderLinesChart(canvas, trend.map((t) => t.date), [{ label: "できた技の数", data: trend.map((t) => t.value), color: domain.color }], { unit: "個", min: 0, legend: false });
    }
  }

  async function load() {
    if (!isConnected()) {
      paintSkills();
      paintSummary();
      return setStatus("チェックを保存するには「設定」でスプレッドシートと接続してください。");
    }
    setStatus("読み込み中…");
    try {
      records = (await api.getRecords(domain.id)).filter((r) => allMetrics.has(r.metric));
      loaded = true;
      paintSkills();
      paintSummary();
      setStatus(records.length ? "" : "まだチェックがありません。できるようになった技をタップしましょう。");
    } catch (err) {
      setStatus(err.message, true);
    }
  }

  container.querySelectorAll("[data-sport-tab]").forEach((tab) => {
    tab.addEventListener("click", () => {
      container.querySelectorAll("[data-sport-tab]").forEach((t) => t.setAttribute("aria-selected", t === tab));
      sportBox.innerHTML = sportPanel(sports[tab.dataset.sportTab], options);
      paintSkills();
    });
  });

  sportBox.addEventListener("click", async (e) => {
    const btn = e.target.closest("[data-skill]");
    if (!btn || btn.disabled) return;
    if (!isConnected()) return setStatus("先に「設定」で接続してください。", true);
    if (!loaded) return setStatus("記録を読み込めていません。ページを再読み込みしてください。", true);

    const next = (Number(btn.dataset.level) + 1) % LEVELS.length;
    btn.disabled = true;
    setStatus(`「${btn.dataset.name}」を保存中…`);
    try {
      const record = await api.addRecord({
        domain: domain.id, metric: btn.dataset.skill, date: today(), value: next, unit: "段階", memo: "",
      });
      records.push(record);
      paintSkills();
      paintSummary();
      setStatus(`「${btn.dataset.name}」を「${LEVELS[next]}」にしました。`);
    } catch (err) {
      setStatus(err.message, true);
    } finally {
      btn.disabled = false;
    }
  });

  load();
}
