// D. 水泳 — 領域固有の学習コンテンツ（泳法解説 ＋ クロールのストローク図解）
// ねらいは高等学校学習指導要領解説（保健体育編）の技能の内容に基づく
import { tabbedCards, setupTabbedCards } from "./shared.js";

const STROKES = [
  {
    name: "クロール",
    aim: "手と足の動き、呼吸のバランスを保ち、安定したペースで長く泳いだり速く泳いだりすること。",
    points: [
      "体を水平に保ち（ストリームライン）、頭は上げすぎず目線は斜め前下に向ける。",
      "手は肩の延長線上に入水し、肘を高く保って水をとらえ、太ももまで押し切る。",
      "キックは脚の付け根から、膝と足首の力を抜いてむちのように上下に打つ。",
      "呼吸はプッシュに合わせて顔を横に向けて吸い、水中では鼻から少しずつ吐く。",
    ],
    rules: [
      "競技では「自由形」として行い、どの泳ぎ方でもよい（一般にクロールで泳ぐ）。",
      "ターンとゴールは体の一部が壁に触れればよい。",
      "スタート・ターン後の潜水は15mまで。それまでに頭が水面に出ていなければならない。",
    ],
  },
  {
    name: "平泳ぎ",
    aim: "手と足の動き、呼吸のバランスを保ち、安定したペースで長く泳いだり速く泳いだりすること。",
    points: [
      "「かく → 吸う → 蹴る → 伸びる」のリズムで、キックの後に1秒程度伸びる。",
      "手は胸の前までかき、肘を前に絞るようにして素早く前に戻す。",
      "キックは足首を曲げ（足の裏を後ろに向け）、足の裏と脚の内側で水を後ろへ押す。",
      "手のかきに合わせて顔を上げて息を吸い、腕を前に戻すときに顔を水に入れる。",
    ],
    rules: [
      "手と足の動きは、左右同時・対称に行う。",
      "足の甲で水を蹴る「あおり足」は泳法違反になる。",
      "ターンとゴールは両手で同時に壁にタッチする。",
    ],
  },
  {
    name: "背泳ぎ",
    aim: "手と足の動き、呼吸のバランスを保ち、安定したペースで長く泳いだり速く泳いだりすること。",
    points: [
      "あごを軽く引き、耳が水につかるくらいで頭を安定させ、腰が沈まないようにする。",
      "手は小指側から肩の延長線上に入水し、肘を曲げて太ももまでかく。",
      "キックは膝が水面から出ないように、足の甲で水を蹴り上げる。",
      "顔が水面に出ているので、腕の動きに合わせてリズムよく呼吸する。",
    ],
    rules: [
      "スタートとゴールを除き、あお向けの姿勢を保って泳ぐ。",
      "ゴールはあお向けのまま壁にタッチする。",
      "スタート・ターン後の潜水は15mまで。",
    ],
    safety: "背泳ぎは進行方向が見えない。壁が近いことを示すフラッグや、手を頭上に伸ばして泳ぐなど、壁への衝突に注意する。",
  },
  {
    name: "バタフライ",
    aim: "手と足の動き、呼吸のバランスを保ち、安定したペースで長く泳いだり速く泳いだりすること。",
    points: [
      "両手を同時に入水し、体のうねり（ドルフィン動作）を使って前に進む。",
      "キックは1回のかきに2回（入水時と、かき終わりのとき）打つ。",
      "かき終わりに合わせてあごを前に出して息を吸い、腕を戻す前に顔を水に入れる。",
      "初めは片手バタフライや、キックだけの練習から段階的に取り組む。",
    ],
    rules: [
      "両腕は同時に水面上を前に戻す。",
      "脚の上下動は左右同時に行う（平泳ぎのキックやばた足は違反）。",
      "ターンとゴールは両手で同時に壁にタッチする。",
    ],
  },
  {
    name: "長く泳ぐ・リレー",
    aim: "複数の泳法で長く泳いだり、リレーをしたりすること。",
    points: [
      "長く泳ぐときは、呼吸が苦しくならないゆったりしたペースを決めて泳ぐ。",
      "平泳ぎやクロールなど、自分が楽に泳げる泳法を組み合わせる。",
      "リレーでは、前の泳者のタッチに合わせて引き継ぎのタイミングを練習する。",
      "メドレーリレーは「背泳ぎ → 平泳ぎ → バタフライ → 自由形」の順に泳ぐ。",
    ],
    rules: [
      "リレーでは、前の泳者が壁にタッチする前に次の泳者が壁（スタート位置）を離れると失格になる。",
      "長く泳ぐ練習では、記録（距離・時間）とその日の体調をメモしておく。",
    ],
    safety: "授業でのスタートは、すべての泳法で水中からのスタートを行う（跳び込みはしない）。",
  },
];

const SAFETY = [
  "体調が悪いとき・睡眠不足のときは無理に泳がず、必ず先生に伝える。",
  "プールサイドは走らない。入水前に準備運動とシャワーを行う。",
  "バディ（2人組）を組み、合図があったらお互いの安全を確認する。",
  "スタートは水中から行う。跳び込みはしない。",
];

// クロールの腕の1周期（肩を中心にした上腕の角度 θ：0°=前方、90°=真下、180°=後方、270°=真上）
const PHASES = [
  { name: "エントリー", from: 340, tip: "手は親指側から、頭の前・肩の延長線上に静かに入水する。入水後は腕を前に伸ばし、体を伸ばしてすべるように進む。" },
  { name: "キャッチ", from: 15, tip: "手のひらと前腕を後ろに向け、肘を高く保ったまま水をとらえる（ハイエルボー）。" },
  { name: "プル", from: 60, tip: "肘を約90°に曲げ、体の真下を通して水を後ろへ運ぶ。このとき反対の腕は前に伸びている。" },
  { name: "プッシュ", from: 120, tip: "太ももの横まで手のひらで水を押し切る。このタイミングで顔を横に向けて息を吸う。" },
  { name: "リカバリー", from: 180, tip: "肘から水面上に抜き、肘を高く保ったまま腕の力を抜いて前に戻す。" },
];

const SWIMMER = { shoulderX: 470, shoulderY: 118, hipX: 320, upper: 55, lower: 55, water: 112 };
const CYCLE = 4000; // 腕1周期の時間（ms）

const rad = (deg) => (deg * Math.PI) / 180;
const norm = (deg) => ((deg % 360) + 360) % 360;
const phaseIndex = (theta) => {
  const t = norm(theta);
  // 340°〜15° をまたぐエントリーは先頭にあるため、後ろから探して見つからなければエントリー
  for (let i = PHASES.length - 1; i >= 1; i--) if (t >= PHASES[i].from && t < (PHASES[i + 1]?.from ?? 340)) return i;
  return 0;
};

// 肘の曲がり（前腕が上腕からどれだけ後ろ下へ曲がるか）。水中は小さく、リカバリーは大きく曲げる
function elbowBend(theta) {
  const t = norm(theta);
  if (t >= 15 && t < 180) return 45 * Math.sin((Math.PI * (t - 15)) / 165);
  if (t >= 180 && t < 330) return 110 * Math.sin((Math.PI * (t - 180)) / 150);
  return 0;
}

function armPoints(theta) {
  const { shoulderX: sx, shoulderY: sy, upper, lower } = SWIMMER;
  const ex = sx + upper * Math.cos(rad(theta));
  const ey = sy + upper * Math.sin(rad(theta));
  const f = theta + elbowBend(theta);
  return `${sx},${sy} ${ex},${ey} ${ex + lower * Math.cos(rad(f))},${ey + lower * Math.sin(rad(f))}`;
}

function strokeFigure() {
  const { shoulderX, shoulderY, hipX, water } = SWIMMER;
  return `
    <svg class="sprint-svg stroke-svg" viewBox="0 30 800 200" role="img" aria-label="クロールの腕のかき（エントリー・キャッチ・プル・プッシュ・リカバリー）の図解">
      <rect class="water" x="0" y="${water}" width="800" height="${240 - water}"></rect>
      <line class="surface" x1="0" y1="${water}" x2="800" y2="${water}"></line>
      <text class="label" x="16" y="${water - 8}">水面</text>
      <text class="label" x="784" y="${water - 8}" text-anchor="end">進む向き →</text>
      <polyline class="arm arm--back" data-arm="1" points=""></polyline>
      <line class="body" x1="${hipX}" y1="${shoulderY + 4}" x2="${shoulderX}" y2="${shoulderY}"></line>
      <line class="leg" data-leg="0" x1="${hipX}" y1="${shoulderY + 4}" x2="${hipX - 130}" y2="${shoulderY + 4}"></line>
      <line class="leg" data-leg="1" x1="${hipX}" y1="${shoulderY + 4}" x2="${hipX - 130}" y2="${shoulderY + 4}"></line>
      <circle class="head" cx="${shoulderX + 30}" cy="${shoulderY - 6}" r="13"></circle>
      <polyline class="arm arm--front" data-arm="0" points=""></polyline>
    </svg>`;
}

function setupStrokeAnimation(root) {
  // DOM 上は奥の腕が先（体の後ろに描くため）なので、番号で取り出す
  const arms = [0, 1].map((i) => root.querySelector(`[data-arm="${i}"]`));
  const legs = root.querySelectorAll("[data-leg]");
  const tipTitle = root.querySelector("[data-tip-title]");
  const tipText = root.querySelector("[data-tip-text]");
  const phaseButtons = root.querySelectorAll("[data-phase]");
  const playBtn = root.querySelector("[data-play]");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const { hipX, shoulderY } = SWIMMER;

  let theta = 0; // 強調表示する腕（手前の腕）の角度
  let playing = false;
  let last = 0;

  function draw() {
    arms[0].setAttribute("points", armPoints(theta));
    arms[1].setAttribute("points", armPoints(theta + 180));
    // キックは腕1周期に6回（6ビート）
    const kick = Math.sin(rad(theta * 6)) * 8;
    legs[0].setAttribute("transform", `rotate(${kick} ${hipX} ${shoulderY + 4})`);
    legs[1].setAttribute("transform", `rotate(${-kick} ${hipX} ${shoulderY + 4})`);

    const index = phaseIndex(theta);
    phaseButtons.forEach((b, i) => b.setAttribute("aria-pressed", i === index));
    tipTitle.textContent = PHASES[index].name;
    tipText.textContent = PHASES[index].tip;
  }

  function frame(now) {
    if (!playing) return;
    theta = norm(theta + ((now - last) / CYCLE) * 360);
    last = now;
    draw();
    requestAnimationFrame(frame);
  }

  function play() {
    playing = true;
    playBtn.textContent = "一時停止";
    last = performance.now();
    requestAnimationFrame(frame);
  }

  function stop() {
    playing = false;
    playBtn.textContent = "再生";
  }

  // 局面ボタン：その局面の中央へ移動して停止
  phaseButtons.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      stop();
      const from = PHASES[i].from;
      const to = PHASES[i + 1]?.from ?? 340;
      theta = norm(from + norm(to - from) / 2);
      draw();
    });
  });

  playBtn.addEventListener("click", () => (playing ? stop() : play()));

  draw();
  if (!reduceMotion) play();
}

export function render(container) {
  container.innerHTML = `
    <section class="panel">
      <h2>安全に学習するために</h2>
      <ul class="safety-list">${SAFETY.map((s) => `<li>${s}</li>`).join("")}</ul>
    </section>
    <section class="panel">
      <h2>図解：クロールの腕のかき</h2>
      <div class="sprint-figure">
        ${strokeFigure()}
        <div class="phase-controls">
          ${PHASES.map((p, i) => `<button type="button" data-phase="${i}">${i + 1}. ${p.name}</button>`).join("")}
          <button type="button" class="btn" data-play>再生</button>
        </div>
        <div class="tip" role="status" aria-live="polite">
          <strong data-tip-title></strong>
          <p data-tip-text></p>
        </div>
        <p class="note">色の濃い腕が手前の腕です。反対の腕はちょうど半周ずれて動きます。</p>
      </div>
    </section>
    ${tabbedCards("泳法別の学習ポイントとルール", STROKES)}`;

  setupTabbedCards(container.querySelector("[data-tabbed-cards]"), STROKES);
  setupStrokeAnimation(container);
}
