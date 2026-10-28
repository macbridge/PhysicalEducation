// C. 陸上競技 — 領域固有の学習コンテンツ（種目解説 ＋ 短距離走の局面図解）
// ねらいは高等学校学習指導要領解説（保健体育編）の技能の内容に基づく
import { tabbedCards, setupTabbedCards } from "./shared.js";

const EVENTS = [
  {
    name: "短距離走・リレー",
    aim: "中間走の高いスピードを維持して速く走ること、リレーでは次走者のスピードを十分に高めること。",
    points: [
      "スタートは号砲に素早く反応し、スターティングブロックを両足で強く押す。",
      "加速局面では上体を前傾させ、少しずつ起こしながらスピードを上げる。",
      "中間疾走では腕を前後に大きく振り、体の真下で接地して地面を素早く押す。",
      "リレーでは前走者が目印（マーク）を通過したら次走者がスタートし、スピードに乗った状態でバトンを受け取る。",
    ],
    rules: [
      "不正スタート（フライング）は1回で失格になる。",
      "自分のレーンを走る（レーンの内側のラインを踏み続けると失格の対象）。",
      "4×100mリレーのバトンパスは30mのテイクオーバーゾーン内で完了させる。",
    ],
  },
  {
    name: "長距離走",
    aim: "ペースの変化に対応するなどして走ること。",
    points: [
      "自分の目標タイムから1周（400m）あたりのペースを決めて走る。",
      "上体をリラックスさせ、無駄な上下動の少ない走りを心がける。",
      "呼吸は「吸う・吸う・吐く・吐く」などリズムを決めると楽に走れる。",
      "集団走やペースの上げ下げに対応できるよう、ラップタイムを記録して振り返る。",
    ],
    rules: [
      "他の走者を押したり進路を妨げたりしてはいけない。",
      "トラックの内側（縁石・ライン）より内に入って近道をしてはいけない。",
    ],
  },
  {
    name: "ハードル走",
    aim: "スピードを維持した走りからハードルを低くリズミカルに越すこと。",
    points: [
      "スタートから1台目までの歩数を決め、毎回同じ足で踏み切る。",
      "踏み切りはハードルから遠めの位置で行い、振り上げ脚をまっすぐ前に出す。",
      "抜き脚は膝を横に開いて素早く前に引き出し、着地後すぐに走り出す。",
      "インターバルは3歩（または5歩）のリズムを保つ。",
    ],
    rules: [
      "ハードルを倒しても失格にはならないが、手や足で故意に倒すと失格になる。",
      "ハードルの外側から脚を通してはいけない。",
    ],
  },
  {
    name: "走り幅跳び",
    aim: "スピードに乗った助走と力強い踏み切りから着地までの動きを滑らかにして跳ぶこと。",
    points: [
      "助走の歩数とスタート位置を決め、踏み切り板に合わせる練習をする。",
      "踏み切り前の数歩でリズムを上げ、上体を起こして力強く踏み切る。",
      "空中では「かがみ跳び」「反り跳び」などで姿勢を保ち、着地で足を前に投げ出す。",
    ],
    rules: [
      "踏み切り線を越えて踏み切るとファウル（無効試技）になる。",
      "記録は踏み切り線から、砂場に残った体の跡のうち最も踏み切り線に近い点までを測る。",
    ],
  },
  {
    name: "走り高跳び",
    aim: "スピードのあるリズミカルな助走から力強く踏み切り、滑らかな空間動作で跳ぶこと。",
    points: [
      "背面跳びでは曲線（J字）の助走で体を内側に傾け、遠心力を利用する。",
      "踏み切りはバーから遠い方の足で、振り上げ脚と両腕を大きく引き上げる。",
      "はさみ跳びは安全で基本となる跳び方。マットの状態を必ず確認する。",
    ],
    rules: [
      "必ず片足で踏み切る（両足踏み切りは無効）。",
      "同じ高さで3回続けて失敗すると競技終了になる。",
    ],
  },
  {
    name: "三段跳び",
    aim: "短い助走からリズミカルに連続して跳ぶこと。",
    points: [
      "ホップ・ステップ・ジャンプの3つの跳躍の距離のバランスを意識する。",
      "ホップで高く跳びすぎず、前へ進む勢いを次の跳躍につなげる。",
      "短い助走・短い距離の練習からリズムを身に付ける。",
    ],
    rules: [
      "ホップとステップは同じ足で踏み切り、ジャンプは反対の足で踏み切る。",
      "踏み切り線を越えて踏み切るとファウルになる。",
    ],
  },
  {
    name: "砲丸投げ",
    aim: "立ち投げなどから砲丸を突き出して投げること。",
    points: [
      "砲丸は指の付け根に乗せ、首（あごの下）に付けて構える。",
      "脚→腰→上体→腕の順に力を伝え、斜め上（約40°）に突き出す。",
      "肘を下げず、腕を「投げる」のではなく「突き出す」動作で放す。",
    ],
    rules: [
      "サークルの外に出たり、足留め材の上部に触れたりするとファウルになる。",
      "砲丸はセクター（扇形）の内側に落ちなければならない。",
      "投げ終わったらサークルの後ろ半分から出る。",
    ],
    safety: "投てき方向に人がいないことを必ず確認し、合図をしてから投げる。",
  },
  {
    name: "やり投げ",
    aim: "短い助走からやりを前方にまっすぐ投げること。",
    points: [
      "やりはグリップの後ろ端に指をかけて持ち、肩の上に構える。",
      "最後の数歩でやりを後ろに引き、体を弓のように反らせてから投げる。",
      "やりの先端と投げる方向をそろえ、真っすぐに力を伝える。",
    ],
    rules: [
      "やりの先端が他の部分より先に地面に着かなければ無効になる。",
      "投げ終わるまでファウルラインを踏み越えてはいけない。",
      "投げ終わるまで投てき方向に背を向けてはいけない。",
    ],
    safety: "授業ではスポンジ製のジャベリックボールなど安全な用具から始める。",
  },
];

// 短距離走（100m）の局面。from は走路全体を 0〜1 とした開始位置
const PHASES = [
  { name: "スタート", from: 0, tip: "「位置について」で前足をスタートラインの手前に置き、「用意」で腰を肩より少し高く上げる。号砲に反応して両足で強く押し出す。" },
  { name: "加速", from: 0.08, tip: "上体を前傾させ、少しずつ起こしながらピッチ（回転）とストライド（歩幅）を伸ばしていく。" },
  { name: "中間疾走", from: 0.35, tip: "上体はほぼまっすぐ。肘を約90°に曲げて腕を前後に大きく振り、体の真下で接地して高いスピードを維持する。" },
  { name: "フィニッシュ", from: 0.88, tip: "スピードを落とさずラインの先まで走り抜ける。胴体（トルソー）がフィニッシュラインに達した時点がゴール。" },
];

// 走路の座標（SVG viewBox 0 0 800 200）
const TRACK = { start: 60, end: 740, ground: 170 };
const DURATION = 6000;
const ACCEL_TIME = 0.4; // 全体時間のうち、加速しきるまでの割合

// 時間 t(0〜1) → 進んだ距離(0〜1)。加速区間は等加速度、その後は一定速度
function distanceAt(t) {
  const vmax = 1 / (1 - ACCEL_TIME / 2);
  return t < ACCEL_TIME ? (vmax * t * t) / (2 * ACCEL_TIME) : vmax * (t - ACCEL_TIME / 2);
}

const phaseAt = (d) => PHASES.findLast((p) => d >= p.from);

function sprintFigure() {
  const { start, end, ground } = TRACK;
  const width = end - start;
  const zones = PHASES.map((p, i) => {
    const x1 = start + width * p.from;
    const x2 = start + width * (PHASES[i + 1]?.from ?? 1);
    return `<g class="zone" data-zone="${i}">
      <rect x="${x1}" y="20" width="${x2 - x1}" height="${ground - 20}" rx="6"></rect>
      <text x="${(x1 + x2) / 2}" y="${ground + 22}" text-anchor="middle">${p.name}</text>
    </g>`;
  }).join("");

  return `
    <svg class="sprint-svg" viewBox="0 0 800 200" role="img" aria-label="100m走の局面（スタート・加速・中間疾走・フィニッシュ）の図解">
      ${zones}
      <line class="ground" x1="20" y1="${ground}" x2="780" y2="${ground}"></line>
      <line class="mark" x1="${start}" y1="${ground - 40}" x2="${start}" y2="${ground}"></line>
      <line class="mark" x1="${end}" y1="${ground - 40}" x2="${end}" y2="${ground}"></line>
      <g class="runner" data-runner>
        <g data-body>
          <line x1="0" y1="0" x2="0" y2="-32"></line>
          <circle cx="0" cy="-42" r="9"></circle>
          <line data-arm="0" x1="0" y1="-28" x2="0" y2="-6"></line>
          <line data-arm="1" x1="0" y1="-28" x2="0" y2="-6"></line>
        </g>
        <line data-leg="0" x1="0" y1="0" x2="0" y2="30"></line>
        <line data-leg="1" x1="0" y1="0" x2="0" y2="30"></line>
      </g>
    </svg>`;
}

function setupSprintAnimation(root) {
  const runner = root.querySelector("[data-runner]");
  const body = root.querySelector("[data-body]");
  const legs = root.querySelectorAll("[data-leg]");
  const arms = root.querySelectorAll("[data-arm]");
  const zones = root.querySelectorAll("[data-zone]");
  const tipTitle = root.querySelector("[data-tip-title]");
  const tipText = root.querySelector("[data-tip-text]");
  const phaseButtons = root.querySelectorAll("[data-phase]");
  const playBtn = root.querySelector("[data-play]");
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  let t = 0;
  let stride = 0;
  let playing = false;
  let last = 0;

  function draw() {
    const d = Math.min(distanceAt(t), 1);
    const x = TRACK.start + (TRACK.end - TRACK.start) * d;
    const speed = t < ACCEL_TIME ? t / ACCEL_TIME : 1;
    // 前傾：スタート直後は大きく、加速とともに起こす。フィニッシュでは胴体を突き出す
    const lean = d >= 0.97 ? 22 : 40 - 33 * speed;
    const swing = 15 + 25 * speed;
    const legA = Math.sin(stride) * swing;

    runner.setAttribute("transform", `translate(${x} ${TRACK.ground - 30})`);
    body.setAttribute("transform", `rotate(${lean})`);
    legs[0].setAttribute("transform", `rotate(${legA})`);
    legs[1].setAttribute("transform", `rotate(${-legA})`);
    arms[0].setAttribute("transform", `rotate(${-legA * 1.3} 0 -28)`);
    arms[1].setAttribute("transform", `rotate(${legA * 1.3} 0 -28)`);

    const phase = phaseAt(d);
    const index = PHASES.indexOf(phase);
    zones.forEach((z, i) => z.classList.toggle("is-active", i === index));
    phaseButtons.forEach((b, i) => b.setAttribute("aria-pressed", i === index));
    tipTitle.textContent = phase.name;
    tipText.textContent = phase.tip;
  }

  function frame(now) {
    if (!playing) return;
    const dt = now - last;
    last = now;
    t = Math.min(t + dt / DURATION, 1);
    stride += (dt / 1000) * (6 + 10 * Math.min(t / ACCEL_TIME, 1));
    draw();
    if (t >= 1) return stop();
    requestAnimationFrame(frame);
  }

  function play() {
    if (t >= 1) t = 0;
    playing = true;
    playBtn.textContent = "一時停止";
    last = performance.now();
    requestAnimationFrame(frame);
  }

  function stop() {
    playing = false;
    playBtn.textContent = t >= 1 ? "もう一度再生" : "再生";
  }

  // 局面ボタン：その局面の中央付近へ移動して停止
  phaseButtons.forEach((btn, i) => {
    btn.addEventListener("click", () => {
      stop();
      const target = (PHASES[i].from + (PHASES[i + 1]?.from ?? 1)) / 2;
      let lo = 0, hi = 1;
      for (let k = 0; k < 30; k++) {
        const mid = (lo + hi) / 2;
        distanceAt(mid) < target ? (lo = mid) : (hi = mid);
      }
      t = lo;
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
      <h2>図解：100m走の4つの局面</h2>
      <div class="sprint-figure">
        ${sprintFigure()}
        <div class="phase-controls">
          ${PHASES.map((p, i) => `<button type="button" data-phase="${i}">${i + 1}. ${p.name}</button>`).join("")}
          <button type="button" class="btn" data-play>再生</button>
        </div>
        <div class="tip" role="status" aria-live="polite">
          <strong data-tip-title></strong>
          <p data-tip-text></p>
        </div>
      </div>
    </section>
    ${tabbedCards("種目別の学習ポイントとルール", EVENTS)}`;

  setupTabbedCards(container.querySelector("[data-tabbed-cards]"), EVENTS);
  setupSprintAnimation(container);
}
