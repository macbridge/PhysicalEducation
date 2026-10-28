// 共通UI：ヘッダー描画、トップの領域カード、領域ページ、設定画面
import { DOMAINS, findDomain } from "./config.js";
import { api, isConnected, isDemo, loadConnection, saveConnection, startDemo, clearConnection } from "./api.js";
import { renderTrendChart } from "./charts.js";
import { parseValue, formatValue, summarize } from "./records.js";

// ルートからの相対パス（index.html は ""、pages/ 配下は "../"）
const root = document.body.dataset.root ?? "";

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function renderHeader() {
  const header = document.querySelector("[data-site-header]");
  if (!header) return;
  const badge = isDemo() ? ' <span class="badge badge--demo">デモ</span>' : isConnected() ? "" : ' <span class="badge">未接続</span>';
  header.innerHTML = `
    <a class="brand" href="${root}index.html">体育ラーニング</a>
    <nav class="site-nav" aria-label="メインメニュー">
      <a href="${root}index.html">ホーム</a>
      <a href="${root}pages/settings.html">設定${badge}</a>
    </nav>`;
}

function renderDomainGrid() {
  const grid = document.querySelector("[data-domain-grid]");
  if (!grid) return;
  grid.innerHTML = DOMAINS.map((d) => `
    <a class="domain-card" href="${root}pages/${d.slug}.html" style="--domain-color:${d.color}">
      <span class="domain-card__id">${d.id}</span>
      <span class="domain-card__name">${d.name}</span>
      <span class="domain-card__summary">${d.summary}</span>
    </a>`).join("");
}

function statTiles(summary, metric) {
  if (!summary.count) return "";
  const { best, latest, diff, improved } = summary;
  let diffText = "-";
  if (diff !== null) {
    const sign = diff > 0 ? "+" : diff < 0 ? "−" : "±";
    diffText = `${sign}${formatValue(Math.abs(diff), { ...metric, format: undefined })}`;
  }
  const diffClass = improved === null || diff === 0 ? "" : improved ? "stat--up" : "stat--down";
  return `
    <div class="stat"><span>ベスト</span><strong>${formatValue(best.value, metric)}</strong><small>${best.date}</small></div>
    <div class="stat"><span>最新</span><strong>${formatValue(latest.value, metric)}</strong><small>${latest.date}</small></div>
    <div class="stat ${diffClass}"><span>前回比</span><strong>${diffText}</strong><small>${improved === null ? "記録2回目から表示" : improved ? "記録が伸びました！" : diff === 0 ? "前回と同じ" : "次はもっといける！"}</small></div>
    <div class="stat"><span>記録回数</span><strong>${summary.count}回</strong></div>`;
}

function recordList(summary, metric) {
  if (!summary.count) return "";
  const rows = [...summary.sorted].reverse().map((r) => `
    <tr>
      <td>${escapeHtml(r.date)}</td>
      <td>${formatValue(r.value, metric)}${r.id === summary.best.id ? ' <span class="best-mark">BEST</span>' : ""}</td>
      <td>${escapeHtml(r.memo || "")}</td>
      <td><button type="button" class="link-btn" data-delete="${escapeHtml(r.id)}" aria-label="${escapeHtml(r.date)}の記録を削除">削除</button></td>
    </tr>`).join("");
  return `
    <details class="record-list">
      <summary>記録の一覧（${summary.count}件）</summary>
      <table><thead><tr><th>日付</th><th>記録</th><th>メモ</th><th></th></tr></thead><tbody>${rows}</tbody></table>
    </details>`;
}

async function renderDomainPage() {
  const el = document.querySelector("[data-domain-page]");
  if (!el) return;
  const d = findDomain(el.dataset.domainPage);
  document.title = `${d.id}. ${d.name}｜体育ラーニング`;
  el.style.setProperty("--domain-color", d.color);

  el.innerHTML = `
    <section class="domain-hero">
      <span class="domain-hero__id">${d.id}</span>
      <h1>${d.name}</h1>
      <p>${d.summary}</p>
    </section>
    <section class="panel">
      <h2>学習する内容</h2>
      <ul class="chip-list">${d.contents.map((c) => `<li>${c}</li>`).join("")}</ul>
    </section>
    <div data-domain-content></div>
    <section class="panel">
      <h2>記録とふり返り</h2>
      <div class="metric-tabs" role="tablist">
        ${d.metrics.map((m, i) => `<button role="tab" data-metric="${m.key}" aria-selected="${i === 0}">${m.label}</button>`).join("")}
      </div>
      <form class="record-form" data-record-form>
        <label>日付 <input type="date" name="date" required></label>
        <label><span>記録（<span data-unit></span>）</span><input type="text" name="value" inputmode="decimal" autocomplete="off" required></label>
        <label class="record-form__memo">メモ <input type="text" name="memo" maxlength="200" placeholder="気づいたこと・次の目標"></label>
        <button type="submit" class="btn">記録する</button>
      </form>
      <p class="status" data-status role="status"></p>
      <div class="stats" data-stats></div>
      <div class="chart-box"><canvas data-chart aria-label="記録の推移グラフ"></canvas></div>
      <div data-record-list></div>
    </section>`;

  if (d.content) {
    const { render } = await import(`./content/${d.slug}.js`);
    render(el.querySelector("[data-domain-content]"), d);
  }

  const form = el.querySelector("[data-record-form]");
  const status = el.querySelector("[data-status]");
  const canvas = el.querySelector("[data-chart]");
  const stats = el.querySelector("[data-stats]");
  const list = el.querySelector("[data-record-list]");
  // valueAsDate は UTC 基準のため、端末のローカル日付で初期値を入れる
  const now = new Date();
  form.date.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  let current = d.metrics[0];

  const setStatus = (msg, isError = false) => {
    status.textContent = msg;
    status.classList.toggle("status--error", isError);
  };
  // 領域コンテンツ（体力テストのレーダーチャート等）に記録の追加・削除を知らせる
  const notifyChanged = () => document.dispatchEvent(new CustomEvent("pe:records-changed", { detail: { domain: d.id } }));

  async function load() {
    el.querySelector("[data-unit]").textContent = current.format === "time" ? "分:秒 または 秒" : current.unit;
    form.value.placeholder = current.format === "time" ? "例: 5:12.3" : "例: 13.2";
    if (!isConnected()) {
      setStatus("記録を保存するには「設定」でスプレッドシートと接続してください。");
      return;
    }
    setStatus("読み込み中…");
    try {
      const records = await api.getRecords(d.id, current.key);
      const summary = summarize(records, current);
      stats.innerHTML = statTiles(summary, current);
      list.innerHTML = recordList(summary, current);
      renderTrendChart(canvas, summary.sorted, { ...current, color: d.color });
      setStatus(records.length ? "" : "まだ記録がありません。最初の記録を入力しましょう。");
    } catch (err) {
      setStatus(err.message, true);
    }
  }

  el.querySelectorAll("[data-metric]").forEach((tab) => {
    tab.addEventListener("click", () => {
      el.querySelectorAll("[data-metric]").forEach((t) => t.setAttribute("aria-selected", t === tab));
      current = d.metrics.find((m) => m.key === tab.dataset.metric);
      load();
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!isConnected()) return setStatus("先に「設定」で接続してください。", true);
    const value = parseValue(form.value.value, current);
    if (!Number.isFinite(value) || value <= 0) {
      return setStatus(current.format === "time" ? "記録は「5:12.3」または「312.3」のように入力してください。" : "記録は数値で入力してください。", true);
    }
    const btn = form.querySelector("button");
    btn.disabled = true;
    setStatus("保存中…");
    try {
      await api.addRecord({
        domain: d.id, metric: current.key, date: form.date.value,
        value, unit: current.unit, memo: form.memo.value,
      });
      form.value.value = "";
      form.memo.value = "";
      await load();
      notifyChanged();
      setStatus("保存しました。");
    } catch (err) {
      setStatus(err.message, true);
    } finally {
      btn.disabled = false;
    }
  });

  list.addEventListener("click", async (e) => {
    const id = e.target.dataset.delete;
    if (!id || !confirm("この記録を削除しますか？")) return;
    try {
      await api.deleteRecord(id);
      await load();
      notifyChanged();
      setStatus("削除しました。");
    } catch (err) {
      setStatus(err.message, true);
    }
  });

  load();
}

function renderSettings() {
  const form = document.querySelector("[data-settings-form]");
  if (!form) return;
  const status = document.querySelector("[data-status]");
  const setStatus = (msg, isError = false) => {
    status.textContent = msg;
    status.classList.toggle("status--error", isError);
  };
  const conn = loadConnection();
  if (conn?.url) {
    form.url.value = conn.url;
    form.token.value = conn.token;
  }
  if (conn?.demo) setStatus("現在デモモードです。記録はこの端末のブラウザにだけ保存されます。");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    saveConnection({ url: form.url.value, token: form.token.value });
    setStatus("接続を確認中…");
    try {
      const info = await api.ping();
      setStatus(`接続できました（スプレッドシート：${info.spreadsheet}）`);
    } catch (err) {
      setStatus(`接続できませんでした：${err.message}`, true);
    }
    renderHeader();
  });

  document.querySelector("[data-demo]").addEventListener("click", () => {
    startDemo();
    form.reset();
    setStatus("デモモードにしました。記録はこの端末のブラウザにだけ保存されます（授業での本番利用には使わないでください）。");
    renderHeader();
  });

  form.querySelector("[data-clear]").addEventListener("click", () => {
    clearConnection();
    form.reset();
    setStatus("接続設定を削除しました。");
    renderHeader();
  });
}

renderHeader();
renderDomainGrid();
renderDomainPage();
renderSettings();
