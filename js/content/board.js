// 作戦ボード（E. 球技）：コート図の上で選手の駒とボールをドラッグして動かす
// 座標はすべて SVG の viewBox（600 × 360）上。配置は保存しない（その場の話し合い用）
const W = 600;
const H = 360;

// 左右対称のコートは左半分だけ描き、反転して右半分にも使う
const mirror = (half) => `${half}<g transform="translate(${W} 0) scale(-1 1)">${half}</g>`;

const COURTS = {
  basketball: `
    <rect class="court-bg" x="20" y="30" width="560" height="300"></rect>
    <line x1="300" y1="30" x2="300" y2="330"></line>
    <circle cx="300" cy="180" r="36"></circle>
    ${mirror(`
      <rect x="20" y="131" width="116" height="98"></rect>
      <circle cx="136" cy="180" r="36"></circle>
      <path d="M20 48 L79 48 A135 135 0 0 1 79 312 L20 312"></path>
      <circle class="goal" cx="51" cy="180" r="5"></circle>`)}`,
  handball: `
    <rect class="court-bg" x="20" y="40" width="560" height="280"></rect>
    <line x1="300" y1="40" x2="300" y2="320"></line>
    ${mirror(`
      <path d="M20 75 A84 84 0 0 1 104 159 L104 201 A84 84 0 0 1 20 285"></path>
      <path class="dashed" d="M61.4 40 A126 126 0 0 1 146 159 L146 201 A126 126 0 0 1 61.4 320"></path>
      <rect class="goal" x="12" y="159" width="8" height="42"></rect>`)}`,
  soccer: `
    <rect class="court-bg" x="37.5" y="10" width="525" height="340"></rect>
    <line x1="300" y1="10" x2="300" y2="350"></line>
    <circle cx="300" cy="180" r="46"></circle>
    ${mirror(`
      <rect x="37.5" y="79.25" width="82.5" height="201.5"></rect>
      <rect x="37.5" y="134.2" width="27.5" height="91.6"></rect>
      <circle class="spot" cx="92.5" cy="180" r="2.5"></circle>
      <path d="M120 143.1 A46 46 0 0 1 120 216.9"></path>
      <rect class="goal" x="30" y="161.7" width="7.5" height="36.6"></rect>`)}`,
  rugby: `
    <rect class="court-bg" x="24" y="19" width="552" height="322"></rect>
    <line x1="300" y1="19" x2="300" y2="341"></line>
    ${mirror(`
      <rect class="in-goal" x="24" y="19" width="46" height="322"></rect>
      <line x1="70" y1="19" x2="70" y2="341"></line>
      <line class="dashed" x1="171" y1="19" x2="171" y2="341"></line>
      <line class="dashed" x1="254" y1="19" x2="254" y2="341"></line>`)}
    <text class="court-label" x="47" y="185" text-anchor="middle">インゴール</text>
    <text class="court-label" x="553" y="185" text-anchor="middle">インゴール</text>`,
  volleyball: `
    <rect class="court-bg" x="30" y="45" width="540" height="270"></rect>
    <line class="net" x1="300" y1="30" x2="300" y2="330"></line>
    ${mirror(`<line x1="210" y1="45" x2="210" y2="315"></line>`)}
    <text class="court-label" x="300" y="22" text-anchor="middle">ネット</text>`,
  badminton: `
    <rect class="court-bg" x="32" y="58" width="536" height="244"></rect>
    <line class="net" x1="300" y1="44" x2="300" y2="316"></line>
    ${mirror(`
      <line x1="221" y1="58" x2="221" y2="302"></line>
      <line x1="62" y1="58" x2="62" y2="302"></line>
      <line x1="32" y1="76" x2="221" y2="76"></line>
      <line x1="32" y1="284" x2="221" y2="284"></line>
      <line x1="32" y1="180" x2="221" y2="180"></line>`)}`,
  tennis: `
    <rect class="court-bg" x="38" y="60" width="524" height="240"></rect>
    <line class="net" x1="300" y1="46" x2="300" y2="314"></line>
    ${mirror(`
      <line x1="38" y1="90" x2="300" y2="90"></line>
      <line x1="38" y1="270" x2="300" y2="270"></line>
      <line x1="159" y1="90" x2="159" y2="270"></line>
      <line x1="159" y1="180" x2="300" y2="180"></line>`)}`,
  tabletennis: `
    <rect class="court-bg" x="40" y="35" width="520" height="290"></rect>
    <line x1="40" y1="180" x2="560" y2="180"></line>
    <line class="net" x1="300" y1="22" x2="300" y2="338"></line>`,
  softball: `
    <path class="court-bg" d="M300 340 L40 80 A368 368 0 0 1 560 80 Z"></path>
    <path class="infield" d="M300 330 L429 201 L300 72 L171 201 Z"></path>
    <line x1="300" y1="330" x2="40" y2="70"></line>
    <line x1="300" y1="330" x2="560" y2="70"></line>
    <circle cx="300" cy="196" r="8"></circle>
    <rect class="base" x="423" y="195" width="12" height="12" transform="rotate(45 429 201)"></rect>
    <rect class="base" x="294" y="66" width="12" height="12" transform="rotate(45 300 72)"></rect>
    <rect class="base" x="165" y="195" width="12" height="12" transform="rotate(45 171 201)"></rect>
    <path class="base" d="M293 326 L307 326 L307 332 L300 338 L293 332 Z"></path>`,
};

const mirrorPoints = (points) => points.map(([x, y]) => [W - x, y]);

// 種目ごとの初期配置。B チームを省略した場合は A チームの左右反転
const SETUPS = {
  basketball: { a: [[250, 180], [200, 100], [200, 260], [120, 90], [120, 270]], ball: [300, 180] },
  handball: { a: [[40, 180], [150, 70], [150, 290], [185, 135], [185, 225], [240, 100], [240, 260]], ball: [300, 180] },
  soccer: {
    a: [[55, 180], [110, 60], [110, 140], [110, 220], [110, 300], [190, 60], [190, 140], [190, 220], [190, 300], [260, 130], [260, 230]],
    ball: [300, 180],
  },
  rugby: { a: [[260, 70], [260, 140], [260, 220], [260, 290], [215, 105], [215, 255], [175, 180]], ball: [300, 180] },
  volleyball: { a: [[255, 90], [255, 180], [255, 270], [120, 90], [120, 180], [120, 270]], ball: [150, 330] },
  badminton: { a: [[200, 120], [120, 240]], ball: [280, 180] },
  tennis: { a: [[250, 130], [60, 230]], ball: [88, 252] },
  tabletennis: { a: [[18, 130], [18, 230]], ball: [120, 180] },
  softball: {
    a: [[300, 210], [300, 352], [410, 180], [365, 125], [235, 125], [190, 180], [150, 70], [300, 30], [450, 70]],
    b: [[345, 345], [380, 345], [415, 345]],
    ball: [312, 196],
  },
};

export const hasBoard = (court) => court in COURTS;

function piece(team, i, [x, y]) {
  const label = team === "ball" ? "ボール" : `${team === "a" ? "味方" : "相手"}${i + 1}`;
  return `
    <g class="piece piece--${team}" data-piece tabindex="0" role="button" aria-label="${label}（ドラッグか矢印キーで移動）" transform="translate(${x} ${y})">
      <circle class="hit" r="26"></circle>
      <circle r="${team === "ball" ? 9 : 15}"></circle>
      ${team === "ball" ? "" : `<text text-anchor="middle" dy="5">${i + 1}</text>`}
    </g>`;
}

function boardSvg(court) {
  const setup = SETUPS[court];
  const b = setup.b ?? mirrorPoints(setup.a);
  return `
    <svg class="board-svg" viewBox="0 0 ${W} ${H}" role="group" aria-label="作戦ボード">
      <g class="court">${COURTS[court]}</g>
      ${b.map((p, i) => piece("b", i, p)).join("")}
      ${setup.a.map((p, i) => piece("a", i, p)).join("")}
      ${piece("ball", 0, setup.ball)}
    </svg>`;
}

function enableDragging(svg) {
  const clamp = (v, max) => Math.min(Math.max(v, 8), max - 8);
  const position = (g) => g.transform.baseVal.consolidate().matrix;
  const moveTo = (g, x, y) => g.setAttribute("transform", `translate(${clamp(x, W)} ${clamp(y, H)})`);
  const toSvg = (e) => {
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(svg.getScreenCTM().inverse());
    return [p.x, p.y];
  };

  svg.querySelectorAll("[data-piece]").forEach((g) => {
    let offset = null;
    g.addEventListener("pointerdown", (e) => {
      const [x, y] = toSvg(e);
      const m = position(g);
      offset = [m.e - x, m.f - y];
      g.setPointerCapture(e.pointerId);
      g.classList.add("is-dragging");
      svg.append(g); // 掴んだ駒を最前面に
      g.focus({ preventScroll: true });
    });
    g.addEventListener("pointermove", (e) => {
      if (!offset) return;
      const [x, y] = toSvg(e);
      moveTo(g, x + offset[0], y + offset[1]);
    });
    const end = () => {
      offset = null;
      g.classList.remove("is-dragging");
    };
    g.addEventListener("pointerup", end);
    g.addEventListener("pointercancel", end);
    g.addEventListener("keydown", (e) => {
      const step = e.shiftKey ? 30 : 10;
      const d = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
      if (!d) return;
      e.preventDefault();
      const m = position(g);
      moveTo(g, m.e + d[0], m.f + d[1]);
    });
  });
}

// container に作戦ボードを描画する。court は COURTS のキー
export function renderBoard(container, court) {
  container.innerHTML = `
    <div class="board">${boardSvg(court)}</div>
    <div class="phase-controls">
      <span class="board-legend"><i class="dot dot--a"></i>味方　<i class="dot dot--b"></i>相手　<i class="dot dot--ball"></i>ボール</span>
      <button type="button" class="btn btn--ghost" data-board-reset>初期配置に戻す</button>
    </div>
    <p class="note">駒はドラッグ（キーボードでは矢印キー）で動かせます。配置は保存されないので、話し合いが終わったら画面を撮影するなどして残しましょう。</p>`;

  const setup = () => enableDragging(container.querySelector("svg"));
  container.querySelector("[data-board-reset]").addEventListener("click", () => {
    container.querySelector(".board").innerHTML = boardSvg(court);
    setup();
  });
  setup();
}
