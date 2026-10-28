// E. 球技 — 領域固有の学習コンテンツ（種目別の解説 ＋ 作戦ボード ＋ 個人スタッツ）
// ねらいは高等学校学習指導要領解説（保健体育編）の型ごとの技能の内容に基づく
// スタッツは「その日のゲームの合計」を項目ごとに Records に1行（metric: "stat:<種目>:<項目>"）。
// 同じ日付で保存し直すと、その日の値は最新の行で上書きされる。コメントは自己評価の行の memo に入れる
import { infoCard } from "./shared.js";
import { renderBoard } from "./board.js";
import { api, isConnected } from "../api.js";
import { renderLinesChart } from "../charts.js";
import { latestByMetric, today } from "../records.js";

const AIMS = {
  goal: "状況に応じたボール操作と空間を埋めるなどの動きによって、空間への侵入などから攻防をすること。",
  net: "状況に応じたボール操作や安定した用具の操作と連携した動きによって、空間を作り出すなどの攻防をすること。",
  base: "状況に応じたバット操作と走塁での攻撃、安定したボール操作と状況に応じた守備などによって攻防をすること。",
};
const TYPES = [
  { key: "goal", name: "ゴール型" },
  { key: "net", name: "ネット型" },
  { key: "base", name: "ベースボール型" },
];

// 1日のゲームを通して数えやすい項目に絞る。rates は「成功数 / 試行数」の割合
const SPORTS = [
  {
    id: "basketball", name: "バスケットボール", type: "goal", court: "basketball",
    points: [
      "パスを受けたらすぐにゴールを見て、シュート・パス・ドリブルの中から判断する。",
      "ボールを持たないときは、ディフェンスのいない空間に動いてパスを受ける（ギブアンドゴー）。",
      "守備では、相手とゴールを結んだ線上に立ち、ボールと相手の両方を見る。",
    ],
    rules: [
      "1チーム5人。シュートは2点、3ポイントラインの外からは3点、フリースローは1点。",
      "ボールを持って3歩以上歩くとトラベリング。ドリブルを止めて再びドリブルするとダブルドリブル。",
      "攻撃側は相手の制限区域内に3秒を超えてとどまってはいけない。",
    ],
    stats: [
      { key: "shots", label: "シュート数" }, { key: "made", label: "シュート成功" },
      { key: "assists", label: "アシスト" }, { key: "rebounds", label: "リバウンド" }, { key: "steals", label: "スティール" },
    ],
    rates: [{ label: "シュート成功率", num: "made", den: "shots" }],
  },
  {
    id: "handball", name: "ハンドボール", type: "goal", court: "handball",
    points: [
      "ジャンプシュートは、踏み切りで高く跳び、ゴールキーパーの位置を見てコースをねらう。",
      "パスは相手の胸の前へ。走り込む味方には、走る先の空間にパスを出す。",
      "守備は6mラインの前でゴールエリアを囲むように並び、シュートコースを消す。",
    ],
    rules: [
      "1チーム7人（ゴールキーパー1人を含む）。",
      "ボールを持って4歩以上歩くとオーバーステップ。ボールを3秒を超えて持ち続けてはいけない。",
      "ゴールエリア（6mライン内）に入れるのはゴールキーパーだけ。",
    ],
    stats: [
      { key: "shots", label: "シュート数" }, { key: "goals", label: "得点" },
      { key: "assists", label: "アシスト" }, { key: "intercepts", label: "パスカット" },
    ],
    rates: [{ label: "シュート成功率", num: "goals", den: "shots" }],
  },
  {
    id: "soccer", name: "サッカー", type: "goal", court: "soccer",
    points: [
      "ボールを受ける前に周りを見て（首を振って）、次のプレーを決めておく。",
      "パスを出したら止まらずに動き、もう一度パスを受けられる位置に移動する。",
      "守備はボールを持つ相手に1人が寄せ、他の人はパスコースやスペースを埋める。",
    ],
    rules: [
      "1チーム11人（授業では人数やコートを小さくして行うことが多い）。",
      "手や腕でボールを扱えるのは、自陣ペナルティーエリア内のゴールキーパーだけ。",
      "オフサイド：相手陣内で、ボールと後ろから2人目の相手より前にいる味方にパスを出すと反則になる。",
    ],
    stats: [
      { key: "shots", label: "シュート数" }, { key: "goals", label: "得点" },
      { key: "assists", label: "アシスト" }, { key: "tackles", label: "ボール奪取" },
    ],
    rates: [{ label: "シュート成功率", num: "goals", den: "shots" }],
  },
  {
    id: "rugby", name: "ラグビー", type: "goal", court: "rugby",
    points: [
      "ボールを持ったら、まず前（相手のいない空間）に走ってゲインラインを越える。",
      "パスは真横か後ろへ。走りながら受けられるよう、味方は少し後ろから走り込む。",
      "授業ではタグラグビーで行い、タグを取られたら止まって素早くパスをつなぐ。",
    ],
    rules: [
      "ボールを前に投げるとスローフォワード、前に落とすとノックオンの反則。",
      "相手のインゴールにボールを置くとトライ（5点）。",
      "タグラグビーでは、タックルの代わりに腰のタグを取る。取ったタグは相手に返す。",
    ],
    stats: [
      { key: "tries", label: "トライ" }, { key: "carries", label: "ボールを持って走った回数" },
      { key: "passes", label: "パス" }, { key: "tags", label: "タグを取った数" },
    ],
    rates: [],
  },
  {
    id: "volleyball", name: "バレーボール", type: "net", court: "volleyball",
    points: [
      "レシーブはボールの正面に入り、腕の面をセッター（ねらう方向）に向ける。",
      "「レシーブ → トス → スパイク」の3回で攻撃を組み立てる。",
      "スパイクは助走で踏み込み、ボールより後ろから高い打点で打つ。",
    ],
    rules: [
      "1チーム6人。相手コートへは3回以内で返す（ブロックの接触は数えない）。",
      "同じ人が続けて2回ボールに触れてはいけない。",
      "サーブ権を得たチームは時計回りにローテーションする。25点先取のラリーポイント制。",
    ],
    stats: [
      { key: "serves", label: "サーブ数" }, { key: "servesIn", label: "サーブ成功" },
      { key: "receives", label: "レシーブ成功" }, { key: "spikes", label: "スパイク得点" },
    ],
    rates: [{ label: "サーブ成功率", num: "servesIn", den: "serves" }],
  },
  {
    id: "tabletennis", name: "卓球", type: "net", court: "tabletennis",
    points: [
      "基本姿勢は、足を肩幅より広く開き、膝を曲げて少し前傾する。",
      "打った後はすぐに基本姿勢に戻り、次のボールに備える。",
      "コースや回転、速さを変えて、相手を左右・前後に動かす。",
    ],
    rules: [
      "11点先取（10対10になったら2点差がつくまで続ける）。",
      "サービスは2本ずつ交代。ボールは手のひらから16cm以上投げ上げて打つ。",
      "サービスは自分のコートに1回、相手のコートに1回バウンドさせる。",
    ],
    stats: [
      { key: "games", label: "試合数" }, { key: "wins", label: "勝った試合" },
      { key: "points", label: "得点" }, { key: "lost", label: "失点" },
    ],
    rates: [{ label: "勝率", num: "wins", den: "games" }],
  },
  {
    id: "tennis", name: "テニス", type: "net", court: "tennis",
    points: [
      "打つ前に体を横に向け（テイクバック）、ボールを体の前でとらえる。",
      "ラリーでは深いボールを打ち、相手をベースラインの後ろに下げる。",
      "ダブルスでは、前衛と後衛が声をかけ合い、コートを2人で守る。",
    ],
    rules: [
      "ポイントは 0（ラブ）→ 15 → 30 → 40 → ゲーム。40対40はデュースになり、2ポイント差で取る。",
      "サービスは対角のサービスコートへ。2回まで打てる（2回失敗するとダブルフォルト）。",
      "6ゲーム先取で1セット（授業では短くして行うことが多い）。",
    ],
    stats: [
      { key: "games", label: "試合数" }, { key: "wins", label: "勝った試合" },
      { key: "serves", label: "サーブ数" }, { key: "servesIn", label: "サーブ成功" },
    ],
    rates: [{ label: "勝率", num: "wins", den: "games" }, { label: "サーブ成功率", num: "servesIn", den: "serves" }],
  },
  {
    id: "badminton", name: "バドミントン", type: "net", court: "badminton",
    points: [
      "打った後はコートの中央（ホームポジション）に戻る。",
      "ハイクリアで相手を後ろに下げ、ドロップやヘアピンで前に動かす。",
      "ラケットは握りしめず、打つ瞬間に握ってシャトルをはじく。",
    ],
    rules: [
      "21点先取のラリーポイント制（20対20からは2点差、29対29では30点目を取った方が勝ち）。",
      "サービスは対角のサービスコートへ、腰より低い位置で下から打つ。",
      "シャトルが相手コートの床に落ちる、または相手が打ったシャトルがアウトになると得点。",
    ],
    stats: [
      { key: "games", label: "試合数" }, { key: "wins", label: "勝った試合" },
      { key: "points", label: "得点" }, { key: "lost", label: "失点" },
    ],
    rates: [{ label: "勝率", num: "wins", den: "games" }],
  },
  {
    id: "softball", name: "ソフトボール", type: "base", court: "softball",
    points: [
      "バットは体の近くから最短距離で出し、ボールを体の前でとらえる。",
      "打ったらすぐに走り出し、一塁は駆け抜ける。次の塁をねらうかはボールの位置を見て判断する。",
      "守備では、打球が飛ぶ前に「どこに投げるか」を決めておき、声をかけ合う。",
    ],
    rules: [
      "1チーム9人（授業では人数を調整することがある）。3アウトで攻守交代、7イニング。",
      "ピッチャーは下手投げ（ウインドミルなど）で投げる。",
      "授業ではスライディングやバットの投げ捨てを禁止するなど、安全のための特別ルールを決める。",
    ],
    safety: "バットを振るときは周りに人がいないか確認する。打者以外はバットを持たない。",
    stats: [
      { key: "atBats", label: "打数" }, { key: "hits", label: "安打" },
      { key: "rbi", label: "打点" }, { key: "runs", label: "得点（ホームイン）" }, { key: "fielding", label: "守備で取ったアウト" },
    ],
    rates: [{ label: "打率", num: "hits", den: "atBats" }],
  },
];

const SELF = { key: "selfeval", label: "ゲームの自己評価" };
const statMetric = (sport, key) => `stat:${sport.id}:${key}`;

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// 日付ごとに、項目別の最新の値をまとめる
function games(records, sport) {
  const own = records.filter((r) => r.metric.startsWith(`stat:${sport.id}:`));
  return [...new Set(own.map((r) => r.date))].sort().map((date) => {
    const rows = own.filter((r) => r.date === date);
    const latest = latestByMetric(rows);
    const values = Object.fromEntries([...sport.stats, SELF].map((s) => [s.key, latest.get(statMetric(sport, s.key))?.value ?? null]));
    return { date, values, memo: latest.get(statMetric(sport, SELF.key))?.memo ?? "", ids: rows.map((r) => r.id) };
  });
}

const sum = (list, key) => list.reduce((acc, g) => acc + (Number(g.values[key]) || 0), 0);
const percent = (num, den) => (den ? `${Math.round((num / den) * 1000) / 10}%` : "—");

function sportPanel(sport) {
  const type = TYPES.find((t) => t.key === sport.type);
  return `
    <section class="panel">
      <h2>${sport.name}の学習ポイントとルール</h2>
      <article class="event-card">${infoCard({ ...sport, name: `${type.name}：${sport.name}`, aim: AIMS[sport.type] })}</article>
    </section>
    <section class="panel">
      <h2>作戦ボード</h2>
      <div data-board></div>
    </section>
    <section class="panel">
      <h2>個人スタッツとゲームのふり返り</h2>
      <form class="eval-form" data-stat-form>
        <div class="eval-form__head">
          <label>日付 <input type="date" name="date" required value="${today()}"></label>
        </div>
        <p class="note">その日のゲームの合計を入力します。同じ日付で保存し直すと、その日の記録が上書きされます。</p>
        <div class="stat-inputs">
          ${sport.stats.map((s) => `<label>${s.label}<input type="number" name="${s.key}" min="0" step="1" inputmode="numeric"></label>`).join("")}
        </div>
        <fieldset class="eval-row">
          <legend>${SELF.label}（作戦や役割を果たせたか）</legend>
          <div class="scale">
            ${[1, 2, 3, 4, 5].map((v) => `<label><input type="radio" name="${SELF.key}" value="${v}"><span>${v}</span></label>`).join("")}
          </div>
        </fieldset>
        <label>ふり返り（よかったプレー・次の課題）<input type="text" name="memo" maxlength="200"></label>
        <button type="submit" class="btn">記録する</button>
      </form>
      <p class="status" data-stat-status role="status"></p>
      <div data-stat-result hidden>
        <div class="stats" data-stat-tiles></div>
        <div class="metric-tabs" role="tablist" data-stat-tabs>
          ${[...sport.stats, SELF].map((s, i) => `<button role="tab" data-stat-tab="${s.key}" aria-selected="${i === 0}">${s.label}</button>`).join("")}
        </div>
        <div class="chart-box"><canvas data-stat-chart aria-label="選んだ項目の推移グラフ"></canvas></div>
        <details class="record-list">
          <summary data-stat-count></summary>
          <div class="table-scroll"><table data-stat-table></table></div>
        </details>
      </div>
    </section>`;
}

function setupSportPanel(box, sport, domain, state) {
  const form = box.querySelector("[data-stat-form]");
  const status = box.querySelector("[data-stat-status]");
  const result = box.querySelector("[data-stat-result]");
  let selected = sport.stats[0].key;

  const setStatus = (msg, isError = false) => {
    status.textContent = msg;
    status.classList.toggle("status--error", isError);
  };

  function paint() {
    const list = games(state.records, sport);
    result.hidden = !list.length;
    if (!list.length) return;

    const tile = (label, value, sub = "") => `<div class="stat"><span>${label}</span><strong>${value}</strong><small>${sub}</small></div>`;
    box.querySelector("[data-stat-tiles]").innerHTML = tile("記録した日数", `${list.length}日`)
      + sport.rates.map((r) => tile(r.label, percent(sum(list, r.num), sum(list, r.den)), `通算 ${sum(list, r.num)} / ${sum(list, r.den)}`)).join("")
      + sport.stats.slice(0, 3).map((s) => tile(`${s.label}（通算）`, sum(list, s.key))).join("");

    const item = [...sport.stats, SELF].find((s) => s.key === selected);
    renderLinesChart(
      box.querySelector("[data-stat-chart]"),
      list.map((g) => g.date),
      [{ label: item.label, data: list.map((g) => g.values[item.key]), color: domain.color }],
      { min: 0, max: item.key === SELF.key ? 5 : undefined, legend: false },
    );

    const columns = [...sport.stats, SELF];
    box.querySelector("[data-stat-count]").textContent = `記録の一覧（${list.length}日分）`;
    box.querySelector("[data-stat-table]").innerHTML = `
      <thead><tr><th>日付</th>${columns.map((c) => `<th>${c.label}</th>`).join("")}<th>ふり返り</th><th></th></tr></thead>
      <tbody>${[...list].reverse().map((g) => `
        <tr>
          <td>${escapeHtml(g.date)}</td>
          ${columns.map((c) => `<td>${g.values[c.key] ?? "—"}</td>`).join("")}
          <td>${escapeHtml(g.memo)}</td>
          <td><button type="button" class="link-btn" data-delete-game="${escapeHtml(g.ids.join(","))}">削除</button></td>
        </tr>`).join("")}
      </tbody>`;
  }

  box.querySelectorAll("[data-stat-tab]").forEach((tab) => {
    tab.addEventListener("click", () => {
      box.querySelectorAll("[data-stat-tab]").forEach((t) => t.setAttribute("aria-selected", t === tab));
      selected = tab.dataset.statTab;
      paint();
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!isConnected()) return setStatus("先に「設定」で接続してください。", true);
    if (!state.loaded) return setStatus("記録を読み込めていません。ページを再読み込みしてください。", true);
    const entries = sport.stats
      .filter((s) => form[s.key].value !== "")
      .map((s) => ({ key: s.key, value: Number(form[s.key].value), memo: "" }));
    if (form[SELF.key].value) entries.push({ key: SELF.key, value: Number(form[SELF.key].value), memo: form.memo.value });
    if (!entries.length) return setStatus("記録する項目を1つ以上入力してください。", true);
    if (entries.some((x) => !Number.isInteger(x.value) || x.value < 0)) return setStatus("回数は0以上の整数で入力してください。", true);
    for (const r of sport.rates) {
      const num = entries.find((x) => x.key === r.num);
      const den = entries.find((x) => x.key === r.den);
      if (num && den && num.value > den.value) return setStatus(`「${r.label}」の分子が分母より大きくなっています。入力を確認してください。`, true);
    }

    const btn = form.querySelector("[type=submit]");
    btn.disabled = true;
    setStatus("保存中…");
    try {
      // GAS 側は1行ずつ追加するため、項目の数だけ順に送る
      for (const x of entries) {
        const record = await api.addRecord({
          domain: domain.id, metric: statMetric(sport, x.key), date: form.date.value,
          value: x.value, unit: x.key === SELF.key ? "点" : "回", memo: x.memo,
        });
        state.records.push(record);
      }
      form.reset();
      form.date.value = today();
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
    const ids = e.target.dataset.deleteGame?.split(",");
    if (!ids || !confirm("この日の記録を削除しますか？")) return;
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

  renderBoard(box.querySelector("[data-board]"), sport.court);
  return { paint, setStatus };
}

export function render(container, domain) {
  container.innerHTML = `
    <section class="panel">
      <h2>種目を選ぶ</h2>
      ${TYPES.map((t) => `
        <div class="sport-type">
          <h3>${t.name}</h3>
          <div class="metric-tabs" role="tablist">
            ${SPORTS.filter((s) => s.type === t.key).map((s) => `<button role="tab" data-sport="${s.id}" aria-selected="${s === SPORTS[0]}">${s.name}</button>`).join("")}
          </div>
        </div>`).join("")}
    </section>
    <div data-sport-box></div>`;

  const box = container.querySelector("[data-sport-box]");
  const state = { records: [], loaded: false };
  let current;

  function show(sport) {
    box.innerHTML = sportPanel(sport);
    current = setupSportPanel(box, sport, domain, state);
    current.paint();
  }

  container.querySelectorAll("[data-sport]").forEach((tab) => {
    tab.addEventListener("click", () => {
      container.querySelectorAll("[data-sport]").forEach((t) => t.setAttribute("aria-selected", t === tab));
      show(SPORTS.find((s) => s.id === tab.dataset.sport));
    });
  });

  show(SPORTS[0]);

  (async () => {
    if (!isConnected()) return current.setStatus("記録を保存するには「設定」でスプレッドシートと接続してください。");
    current.setStatus("読み込み中…");
    try {
      state.records = (await api.getRecords(domain.id)).filter((r) => r.metric.startsWith("stat:"));
      state.loaded = true;
      current.paint();
      current.setStatus("");
    } catch (err) {
      current.setStatus(err.message, true);
    }
  })();
}
