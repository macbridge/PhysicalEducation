// 領域コンテンツ共通の部品（解説カード・タブ切り替え）

// ねらい＋ポイント＋ルール（＋安全）の解説カード
export function infoCard(e, { pointsTitle = "技能のポイント", rulesTitle = "主なルール" } = {}) {
  return `
    <h3>${e.name}</h3>
    <p class="aim"><strong>ねらい</strong>　${e.aim}</p>
    <div class="two-col">
      <div>
        <h4>${pointsTitle}</h4>
        <ol>${e.points.map((p) => `<li>${p}</li>`).join("")}</ol>
      </div>
      <div>
        <h4>${rulesTitle}</h4>
        <ul>${e.rules.map((r) => `<li>${r}</li>`).join("")}</ul>
        ${e.safety ? `<p class="safety">⚠ 安全　${e.safety}</p>` : ""}
      </div>
    </div>`;
}

// タブ付き解説パネル（items を infoCard で切り替え表示）
export function tabbedCards(title, items, options) {
  return `
    <section class="panel" data-tabbed-cards>
      <h2>${title}</h2>
      <div class="metric-tabs" role="tablist">
        ${items.map((e, i) => `<button role="tab" data-card-tab="${i}" aria-selected="${i === 0}">${e.name}</button>`).join("")}
      </div>
      <article class="event-card" data-card>${infoCard(items[0], options)}</article>
    </section>`;
}

export function setupTabbedCards(panel, items, options) {
  const card = panel.querySelector("[data-card]");
  const tabs = panel.querySelectorAll("[data-card-tab]");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.setAttribute("aria-selected", t === tab));
      card.innerHTML = infoCard(items[tab.dataset.cardTab], options);
    });
  });
}
