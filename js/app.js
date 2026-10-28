// 共通UI：ヘッダー描画、トップの領域カード、領域ページ、設定画面
import { DOMAINS, findDomain } from "./config.js";
import { api, isConnected, loadConnection, saveConnection, clearConnection } from "./api.js";
import { renderTrendChart } from "./charts.js";

// ルートからの相対パス（index.html は ""、pages/ 配下は "../"）
const root = document.body.dataset.root ?? "";

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function renderHeader() {
  const header = document.querySelector("[data-site-header]");
  if (!header) return;
  header.innerHTML = `
    <a class="brand" href="${root}index.html">体育ラーニング</a>
    <nav class="site-nav" aria-label="メインメニュー">
      <a href="${root}index.html">ホーム</a>
      <a href="${root}pages/settings.html">設定${isConnected() ? "" : ' <span class="badge">未接続</span>'}</a>
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
    <section class="panel">
      <h2>記録とふり返り</h2>
      <div class="metric-tabs" role="tablist">
        ${d.metrics.map((m, i) => `<button role="tab" data-metric="${m.key}" aria-selected="${i === 0}">${m.label}</button>`).join("")}
      </div>
      <form class="record-form" data-record-form>
        <label>日付 <input type="date" name="date" required></label>
        <label>記録 <input type="number" name="value" step="any" inputmode="decimal" required> <span data-unit></span></label>
        <label class="record-form__memo">メモ <input type="text" name="memo" maxlength="200" placeholder="気づいたこと・次の目標"></label>
        <button type="submit" class="btn">記録する</button>
      </form>
      <p class="status" data-status role="status"></p>
      <div class="chart-box"><canvas data-chart aria-label="記録の推移グラフ"></canvas></div>
    </section>`;

  const form = el.querySelector("[data-record-form]");
  const status = el.querySelector("[data-status]");
  const canvas = el.querySelector("[data-chart]");
  form.date.valueAsDate = new Date();
  let current = d.metrics[0];

  const setStatus = (msg, isError = false) => {
    status.textContent = msg;
    status.classList.toggle("status--error", isError);
  };

  async function load() {
    el.querySelector("[data-unit]").textContent = current.unit;
    if (!isConnected()) {
      setStatus("記録を保存するには「設定」でスプレッドシートと接続してください。");
      return;
    }
    setStatus("読み込み中…");
    try {
      const records = await api.getRecords(d.id, current.key);
      renderTrendChart(canvas, records, { ...current, color: d.color });
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
    const btn = form.querySelector("button");
    btn.disabled = true;
    setStatus("保存中…");
    try {
      await api.addRecord({
        domain: d.id, metric: current.key, date: form.date.value,
        value: Number(form.value.value), unit: current.unit, memo: form.memo.value,
      });
      form.value.value = "";
      form.memo.value = "";
      await load();
      setStatus("保存しました。");
    } catch (err) {
      setStatus(err.message, true);
    } finally {
      btn.disabled = false;
    }
  });

  load();
}

function renderSettings() {
  const form = document.querySelector("[data-settings-form]");
  if (!form) return;
  const status = document.querySelector("[data-status]");
  const conn = loadConnection();
  if (conn) {
    form.url.value = conn.url;
    form.token.value = conn.token;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    saveConnection({ url: form.url.value, token: form.token.value });
    status.textContent = "接続を確認中…";
    status.classList.remove("status--error");
    try {
      const info = await api.ping();
      status.textContent = `接続できました（スプレッドシート：${escapeHtml(info.spreadsheet)}）`;
    } catch (err) {
      status.textContent = `接続できませんでした：${err.message}`;
      status.classList.add("status--error");
    }
    renderHeader();
  });

  form.querySelector("[data-clear]").addEventListener("click", () => {
    clearConnection();
    form.reset();
    status.textContent = "接続設定を削除しました。";
    renderHeader();
  });
}

renderHeader();
renderDomainGrid();
renderDomainPage();
renderSettings();
