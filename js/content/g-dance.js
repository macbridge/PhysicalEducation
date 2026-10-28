// G. ダンス — 領域固有の学習コンテンツ（種類別の解説 ＋ 自己評価・相互評価のワークシート）
// ねらいは高等学校学習指導要領解説（保健体育編）に基づく
// 評価は観点ごとに Records に1行（metric: "eval:<種類>:<self|peer>:<観点番号>", value: 1〜5）。
// 同じ日付・同じ評価者の行をまとめて「1回の評価」として扱う。コメントは観点1の行の memo に入れる
import { infoCard } from "./shared.js";
import { api, isConnected } from "../api.js";
import { renderRadarChart, renderLinesChart } from "../charts.js";
import { latestByMetric, today } from "../records.js";

export const DANCES = [
  {
    id: "sosaku",
    name: "創作ダンス",
    aim: "表したいテーマにふさわしいイメージをとらえ、個や群で、対極の動きや空間の使い方で変化を付けて即興的に表現したり、イメージを強調した作品にまとめたりして踊ること。",
    points: [
      "テーマ（例：「激しい」「静と動」「祭り」）から、イメージを広げて動きを見付ける。",
      "「高い－低い」「速い－遅い」「集まる－離れる」など対極の動きで変化と起伏を付ける。",
      "群（グループ）の動きは、ユニゾン（同じ動き）とカノン（ずらす動き）を組み合わせる。",
      "「はじめ－なか－おわり」の構成で、一番見せたい場面（山場）をはっきりさせる。",
    ],
    rules: [
      "発表会では、作品名とテーマを紹介してから踊る。",
      "見る人は、よかった動きや工夫を具体的に伝える。",
    ],
    criteria: ["テーマにふさわしい動きを見付けた", "動きに変化と起伏を付けた", "仲間と群の動きを工夫した", "感じを込めて表現した"],
  },
  {
    id: "folk",
    name: "フォークダンス",
    aim: "日本の民踊や外国のフォークダンスの踊り方の特徴をとらえ、音楽に合わせて多様なステップや動きと組み方で仲間と対応して踊ること。",
    points: [
      "日本の民踊は、低く踏みしめる足どりや、手ぬぐい・扇などの小道具を使った動きの特徴をとらえる。",
      "外国のフォークダンスは、ステップ（ショティッシュ・ポルカ・グレープバイン等）を正確に踏む。",
      "パートナーと組むときは、相手の動きに合わせて力を加減し、目を合わせて踊る。",
      "踊りが生まれた地域や由来、踊りに込められた意味を調べる。",
    ],
    rules: [
      "踊りの始まりと終わりには、パートナーや仲間とあいさつをする。",
    ],
    criteria: ["踊り方の特徴をとらえた", "ステップや組み方を正確に踊った", "仲間と動きを合わせて踊った", "踊りの由来や背景を理解した"],
  },
  {
    id: "rhythm",
    name: "現代的なリズムのダンス",
    aim: "リズムの特徴をとらえ、変化とまとまりを付けて、リズムに乗って全身で踊ること。",
    points: [
      "ロックやヒップホップなどのリズムの特徴（アップ・ダウンのノリ）を体幹でとらえる。",
      "首・肩・腰など体の部分を使ったアイソレーションで動きを強調する。",
      "動きの速さ・向き・人数を変えて、変化とまとまりのある踊りにする。",
      "仲間と動きを合わせたり、掛け合ったりして関わり合って踊る。",
    ],
    rules: [
      "発表では、8カウント×数セットのまとまりで構成すると覚えやすい。",
    ],
    criteria: ["リズムの特徴をとらえた", "全身で弾んで踊った", "動きに変化とまとまりを付けた", "仲間と関わり合って踊った"],
  },
];

const WHO = [
  { key: "self", label: "自己評価" },
  { key: "peer", label: "仲間からの評価" },
];
const SCALE = [1, 2, 3, 4, 5];
const evalMetric = (dance, who, index) => `eval:${dance.id}:${who}:${index + 1}`;
const PREFIX = "eval:";

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// 種類ごとに、日付×評価者でまとめた評価の一覧（日付順）を作る
function sessions(records, dance) {
  const groups = new Map();
  for (const who of WHO) {
    const own = records.filter((r) => r.metric.startsWith(`eval:${dance.id}:${who.key}:`));
    for (const date of new Set(own.map((r) => r.date))) {
      const rows = own.filter((r) => r.date === date);
      const latest = latestByMetric(rows);
      const scores = dance.criteria.map((_, i) => latest.get(evalMetric(dance, who.key, i))?.value ?? null);
      const memo = rows.map((r) => r.memo).filter(Boolean).at(-1) ?? "";
      groups.set(`${date}|${who.key}`, { date, who: who.key, scores, memo, ids: rows.map((r) => r.id) });
    }
  }
  return [...groups.values()].sort((a, b) => a.date.localeCompare(b.date) || a.who.localeCompare(b.who));
}

const total = (scores) => scores.reduce((sum, v) => sum + (Number(v) || 0), 0);

function dancePanel(dance) {
  return `
    <article class="event-card">${infoCard(dance)}</article>
    <h3 class="skill-heading">評価シート（${dance.name}）</h3>
    <form class="eval-form" data-eval-form>
      <div class="eval-form__head">
        <label>日付 <input type="date" name="date" required value="${today()}"></label>
        <fieldset class="segmented">
          <legend>評価する人</legend>
          ${WHO.map((w, i) => `<label><input type="radio" name="who" value="${w.key}" ${i === 0 ? "checked" : ""}> ${w.label}</label>`).join("")}
        </fieldset>
      </div>
      ${dance.criteria.map((c, i) => `
        <fieldset class="eval-row">
          <legend>${i + 1}. ${c}</legend>
          <div class="scale">
            ${SCALE.map((v) => `<label><input type="radio" name="c${i}" value="${v}" required><span>${v}</span></label>`).join("")}
          </div>
        </fieldset>`).join("")}
      <p class="note">5：とてもよくできた　4：よくできた　3：できた　2：もう少し　1：できなかった</p>
      <label>コメント（よかったところ・次の課題）<input type="text" name="memo" maxlength="200"></label>
      <button type="submit" class="btn">評価を保存する</button>
    </form>
    <p class="status" data-eval-status role="status"></p>
    <div data-eval-result hidden>
      <h3 class="skill-heading">最新の評価（自己評価と仲間からの評価）</h3>
      <div class="chart-box chart-box--radar"><canvas data-eval-radar aria-label="最新の自己評価と仲間からの評価のレーダーチャート"></canvas></div>
      <h3 class="skill-heading">合計点の推移（20点満点）</h3>
      <div class="chart-box"><canvas data-eval-trend aria-label="自己評価と仲間からの評価の合計点の推移グラフ"></canvas></div>
      <details class="record-list">
        <summary data-eval-count></summary>
        <div class="table-scroll"><table data-eval-table></table></div>
      </details>
    </div>`;
}

function setupDancePanel(box, dance, domain, state) {
  const form = box.querySelector("[data-eval-form]");
  const status = box.querySelector("[data-eval-status]");
  const result = box.querySelector("[data-eval-result]");
  const muted = getComputedStyle(document.documentElement).getPropertyValue("--muted").trim();
  const colors = { self: domain.color, peer: muted };

  const setStatus = (msg, isError = false) => {
    status.textContent = msg;
    status.classList.toggle("status--error", isError);
  };

  function paint() {
    const list = sessions(state.records, dance);
    result.hidden = !list.length;
    if (!list.length) return;

    const latestOf = (who) => list.filter((s) => s.who === who).at(-1);
    renderRadarChart(
      box.querySelector("[data-eval-radar]"),
      dance.criteria.map((c, i) => `${i + 1}. ${c.length > 9 ? `${c.slice(0, 9)}…` : c}`),
      WHO.filter((w) => latestOf(w.key)).map((w) => ({
        label: `${w.label}（${latestOf(w.key).date}）`, data: latestOf(w.key).scores, color: colors[w.key], dashed: w.key === "peer",
      })),
      { max: 5, step: 1 },
    );

    const dates = [...new Set(list.map((s) => s.date))];
    renderLinesChart(
      box.querySelector("[data-eval-trend]"),
      dates,
      WHO.map((w) => ({
        label: w.label,
        data: dates.map((d) => {
          const s = list.find((x) => x.date === d && x.who === w.key);
          return s ? total(s.scores) : null;
        }),
        color: colors[w.key],
        dashed: w.key === "peer",
      })),
      { unit: "点", min: 0, max: 20 },
    );

    box.querySelector("[data-eval-count]").textContent = `評価の一覧（${list.length}件）`;
    box.querySelector("[data-eval-table]").innerHTML = `
      <thead><tr><th>日付</th><th>評価する人</th>${dance.criteria.map((_, i) => `<th>${i + 1}</th>`).join("")}<th>合計</th><th>コメント</th><th></th></tr></thead>
      <tbody>${[...list].reverse().map((s) => `
        <tr>
          <td>${escapeHtml(s.date)}</td>
          <td>${WHO.find((w) => w.key === s.who).label}</td>
          ${s.scores.map((v) => `<td>${v ?? "—"}</td>`).join("")}
          <td>${total(s.scores)}</td>
          <td>${escapeHtml(s.memo)}</td>
          <td><button type="button" class="link-btn" data-delete-session="${escapeHtml(s.ids.join(","))}">削除</button></td>
        </tr>`).join("")}
      </tbody>`;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!isConnected()) return setStatus("先に「設定」で接続してください。", true);
    if (!state.loaded) return setStatus("記録を読み込めていません。ページを再読み込みしてください。", true);
    const who = form.who.value;
    const btn = form.querySelector("[type=submit]");
    btn.disabled = true;
    setStatus("保存中…");
    try {
      // GAS 側は1行ずつ追加するため、観点の数だけ順に送る
      for (let i = 0; i < dance.criteria.length; i++) {
        const record = await api.addRecord({
          domain: domain.id, metric: evalMetric(dance, who, i), date: form.date.value,
          value: Number(form[`c${i}`].value), unit: "点", memo: i === 0 ? form.memo.value : "",
        });
        state.records.push(record);
      }
      dance.criteria.forEach((_, i) => form.querySelectorAll(`[name=c${i}]`).forEach((r) => (r.checked = false)));
      form.memo.value = "";
      paint();
      setStatus("保存しました。");
    } catch (err) {
      paint();
      setStatus(`${err.message}（途中まで保存された可能性があります。一覧を確認してください）`, true);
    } finally {
      btn.disabled = false;
    }
  });

  box.addEventListener("click", async (e) => {
    const ids = e.target.dataset.deleteSession?.split(",");
    if (!ids || !confirm("この日の評価を削除しますか？")) return;
    try {
      for (const id of ids) {
        await api.deleteRecord(id);
        state.records = state.records.filter((r) => r.id !== id);
      }
      paint();
      setStatus("削除しました。");
    } catch (err) {
      paint();
      setStatus(err.message, true);
    }
  });

  return { paint, setStatus };
}

export function render(container, domain) {
  container.innerHTML = `
    <section class="panel">
      <h2>ダンスの種類別ポイントと評価</h2>
      <div class="metric-tabs" role="tablist">
        ${DANCES.map((d, i) => `<button role="tab" data-dance-tab="${i}" aria-selected="${i === 0}">${d.name}</button>`).join("")}
      </div>
      <div data-dance-panel></div>
    </section>`;

  const box = container.querySelector("[data-dance-panel]");
  const state = { records: [], loaded: false };
  let current;

  function show(dance) {
    box.innerHTML = dancePanel(dance);
    current = setupDancePanel(box, dance, domain, state);
    current.paint();
  }

  container.querySelectorAll("[data-dance-tab]").forEach((tab) => {
    tab.addEventListener("click", () => {
      container.querySelectorAll("[data-dance-tab]").forEach((t) => t.setAttribute("aria-selected", t === tab));
      show(DANCES[tab.dataset.danceTab]);
    });
  });

  show(DANCES[0]);

  (async () => {
    if (!isConnected()) return current.setStatus("評価を保存するには「設定」でスプレッドシートと接続してください。");
    current.setStatus("読み込み中…");
    try {
      state.records = (await api.getRecords(domain.id)).filter((r) => r.metric.startsWith(PREFIX));
      state.loaded = true;
      current.paint();
      current.setStatus("");
    } catch (err) {
      current.setStatus(err.message, true);
    }
  })();
}
