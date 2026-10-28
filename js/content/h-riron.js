// H. 体育理論 — 領域固有の学習コンテンツ（単元ごとの解説 ＋ 確認テスト）
// 内容は高等学校学習指導要領解説（保健体育編）の体育理論の内容に基づく
// テストの得点（100点満点）は、下の「記録とふり返り」と同じ記録項目（unit1〜3）に保存する
import { api, isConnected } from "../api.js";
import { today } from "../records.js";

const UNITS = [
  {
    key: "unit1",
    name: "スポーツの文化的特性や現代のスポーツの発展",
    aim: "スポーツの歴史的発展と多様な変化、現代のスポーツの意義や価値、経済的効果と高潔さ、環境や社会にもたらす影響について理解する。",
    sections: [
      {
        title: "スポーツの歴史的発展と多様な変化",
        text: "スポーツは古くから祭礼や娯楽として行われてきた。19世紀のイギリスで、ルールや競技団体が整えられた「近代スポーツ」が成立し、世界に広まった。現在では、競技としてだけでなく、健康づくりや楽しみのためのスポーツ、障害のある人も参加しやすいようにルールや用具を工夫したスポーツなど、多様に変化している。",
      },
      {
        title: "現代のスポーツの意義や価値",
        text: "オリンピック・パラリンピックなどの国際大会は、国際親善や世界平和に大きな役割を果たしている。近代オリンピックはクーベルタンの提唱により1896年にアテネで第1回大会が開かれた。パラリンピックは、1948年にイギリスのストーク・マンデビル病院で行われた競技会が起源とされる。",
      },
      {
        title: "スポーツの経済的効果と高潔さ",
        text: "スポーツは、用品・施設・観戦・放送などの産業を生み、大きな経済的効果をもたらす。一方で、ドーピングや八百長、暴力などはスポーツの価値を損なう。スポーツの高潔さ（インテグリティ）を守るため、世界アンチ・ドーピング機構（WADA）などが取り組んでいる。",
      },
      {
        title: "スポーツが環境や社会にもたらす影響",
        text: "大会の開催や施設の建設は、自然環境や地域の生活に影響を与えることがある。持続可能な社会の実現に向けて、環境に配慮した大会運営や施設の活用が求められている。",
      },
    ],
    quiz: [
      { q: "ルールや競技団体が整えられた「近代スポーツ」が成立し、世界に広まるきっかけとなった国はどこか。", options: ["アメリカ", "イギリス", "ギリシャ", "日本"], answer: 1, explain: "19世紀のイギリスで、パブリックスクールなどを中心に多くのスポーツのルールや組織が整えられた。" },
      { q: "近代オリンピックの開催を提唱した人物は誰か。", options: ["クーベルタン", "嘉納治五郎", "ネイスミス", "グットマン"], answer: 0, explain: "クーベルタンの提唱で1896年にアテネで第1回大会が開かれた。嘉納治五郎は日本初のIOC委員、ネイスミスはバスケットボールの考案者、グットマンはパラリンピックの父と呼ばれる。" },
      { q: "パラリンピックの起源とされるものはどれか。", options: ["古代オリンピック", "ストーク・マンデビル病院での競技会", "第1回近代オリンピック", "国民体育大会"], answer: 1, explain: "1948年、イギリスのストーク・マンデビル病院で、グットマン医師の提唱により車いす使用者の競技会が行われた。" },
      { q: "競技力を高めるために、禁止された薬物や方法を使用することを何というか。", options: ["コンディショニング", "フェアプレイ", "ドーピング", "スポーツマンシップ"], answer: 2, explain: "ドーピングは公平さを損ない、健康にも害を与える。スポーツの高潔さを守るため、世界的に禁止されている。" },
      { q: "スポーツと環境の関係について、正しいものはどれか。", options: ["スポーツは自然環境に影響を与えることはない", "大規模な大会ほど環境への影響は小さい", "環境への配慮は競技団体だけが考えればよい", "大会運営でも環境への配慮や持続可能性が求められている"], answer: 3, explain: "大会や施設の建設は環境に影響を与えることがあるため、選手・観客・運営者などすべての関係者に環境への配慮が求められている。" },
    ],
  },
  {
    key: "unit2",
    name: "運動やスポーツの効果的な学習の仕方",
    aim: "運動やスポーツの技能と体力、技能の上達過程、効果的な練習の仕方、体力トレーニングとスポーツによるけがや障害について理解する。",
    sections: [
      {
        title: "技術と技能、体力",
        text: "「技術」は、ある運動の課題を合理的に達成するための動き方のこと。練習によってその技術を身に付けた状態を「技能」という。技能と体力は互いに関係し合っており、技能を発揮するためには、その運動に必要な体力も高める必要がある。",
      },
      {
        title: "技能の上達過程",
        text: "技能は「試行錯誤の段階」→「動きを意識して調整する段階」→「意識しなくても動ける自動化の段階」と上達していく。練習を続けても一時的に伸びが止まる「プラトー」や、記録が落ちる「スランプ」が起こることもある。",
      },
      {
        title: "効果的な練習の仕方",
        text: "目標と自分の課題をはっきりさせて練習方法を選ぶ。自分の動きを動画で確認したり、仲間や先生から助言をもらったりするフィードバックを活用すると上達しやすい。",
      },
      {
        title: "体力トレーニングとけがの防止",
        text: "トレーニングの原則には、過負荷（ふだんより強い負荷をかける）、漸進性（少しずつ負荷を高める）、反復性、個別性、全面性、意識性などがある。同じ動作の繰り返しによる使いすぎ（オーバーユース）は障害の原因になる。休養・栄養・ウォーミングアップとクールダウンを大切にする。",
      },
    ],
    quiz: [
      { q: "運動の技術を、練習によって身に付けた状態を何というか。", options: ["技術", "技能", "戦術", "体力"], answer: 1, explain: "技術は合理的な動き方そのもの、技能はそれを身に付けた状態を指す。" },
      { q: "技能の上達過程で、意識しなくても動きができるようになった段階を何というか。", options: ["試行錯誤の段階", "準備の段階", "意識的な調整の段階", "自動化の段階"], answer: 3, explain: "自動化の段階では、動きに注意を向けなくてもよくなり、周りの状況に注意を向けられるようになる。" },
      { q: "練習を続けていても、一時的に上達が止まったように感じる状態を何というか。", options: ["プラトー", "フィードバック", "オーバーロード", "ウォーミングアップ"], answer: 0, explain: "プラトーは上達の途中でよく起こる。練習方法を見直したり、目標を立て直したりすることが大切。" },
      { q: "「体力の向上に合わせて、トレーニングの負荷を少しずつ高めていく」という原則はどれか。", options: ["過負荷の原則", "個別性の原則", "漸進性の原則", "全面性の原則"], answer: 2, explain: "漸進性の原則。急に負荷を上げるとけがやオーバートレーニングの原因になる。" },
      { q: "同じ動作を繰り返すことで、体の一部に負担が集中して起こるスポーツ障害の主な原因はどれか。", options: ["休養のとりすぎ", "使いすぎ（オーバーユース）", "準備運動のしすぎ", "水分のとりすぎ"], answer: 1, explain: "オーバーユースによる障害を防ぐには、練習量の調整や十分な休養、正しいフォームの習得が大切。" },
    ],
  },
  {
    key: "unit3",
    name: "豊かなスポーツライフの設計の仕方",
    aim: "ライフステージに応じたスポーツの楽しみ方、ライフスタイルに応じたスポーツとの関わり方、スポーツ推進のための施策と諸条件、豊かなスポーツライフが広がる未来の社会について理解する。",
    sections: [
      {
        title: "ライフステージとスポーツ",
        text: "年齢や体力、生活環境によってスポーツの楽しみ方は変わる。青年期は競技や仲間との活動を楽しみ、仕事や子育てで忙しい時期は短時間でできる運動を工夫し、高齢期は健康の維持や仲間との交流を目的にするなど、生涯を通じて自分に合った関わり方を見付けることが大切である。",
      },
      {
        title: "ライフスタイルに応じた関わり方",
        text: "スポーツには「する」だけでなく、「みる」「支える」「知る」などの多様な関わり方がある。自分の生活に合わせて、これらを組み合わせて楽しむことができる。",
      },
      {
        title: "スポーツ推進のための施策と諸条件",
        text: "2011年に制定されたスポーツ基本法では、スポーツを通じて幸福で豊かな生活を営むことはすべての人々の権利であるとされた。2015年には国のスポーツ行政を担うスポーツ庁が設置された。スポーツを続けるには、施設・指導者・組織（総合型地域スポーツクラブなど）・情報などの条件が必要である。",
      },
      {
        title: "豊かなスポーツライフが広がる未来の社会",
        text: "年齢・性別・障害の有無などに関わらず、誰もがスポーツを楽しめる共生社会を目指して、ルールや用具を工夫したスポーツ（アダプテッド・スポーツ）や、誰もが使いやすい施設づくりが進められている。",
      },
    ],
    quiz: [
      { q: "2011年に制定され、「スポーツを通じて幸福で豊かな生活を営むことは、全ての人々の権利」と定めた法律はどれか。", options: ["スポーツ振興法", "スポーツ基本法", "学校教育法", "健康増進法"], answer: 1, explain: "スポーツ基本法は、1961年に制定されたスポーツ振興法を全面的に改正して制定された。" },
      { q: "2015年に設置された、国のスポーツ行政を総合的に担う機関はどれか。", options: ["スポーツ庁", "日本スポーツ協会", "国際オリンピック委員会", "総合型地域スポーツクラブ"], answer: 0, explain: "スポーツ庁は文部科学省の外局として設置された。" },
      { q: "スポーツとの多様な関わり方の組み合わせとして、適切なものはどれか。", options: ["する・勝つ・競う・鍛える", "みる・買う・貯める・使う", "する・みる・支える・知る", "走る・跳ぶ・投げる・泳ぐ"], answer: 2, explain: "スポーツは自分で「する」だけでなく、観戦する「みる」、ボランティアや指導で「支える」、歴史や科学を「知る」などの関わり方がある。" },
      { q: "地域の人々が主体的に運営し、多世代・多種目・多志向で活動するスポーツクラブを何というか。", options: ["実業団チーム", "プロスポーツクラブ", "運動部活動", "総合型地域スポーツクラブ"], answer: 3, explain: "総合型地域スポーツクラブは、子どもから高齢者まで、いろいろな種目を、それぞれの目的に合わせて楽しめるクラブである。" },
      { q: "障害の有無などに関わらず参加できるように、ルールや用具を工夫したスポーツを何というか。", options: ["アダプテッド・スポーツ", "エクストリーム・スポーツ", "モータースポーツ", "ウインタースポーツ"], answer: 0, explain: "アダプテッド・スポーツは、人に合わせてスポーツを工夫するという考え方であり、共生社会の実現につながる。" },
    ],
  },
];

const POINTS_PER_QUESTION = 20;

function unitPanel(unit) {
  return `
    <article class="event-card">
      <h3>${unit.name}</h3>
      <p class="aim"><strong>ねらい</strong>　${unit.aim}</p>
      ${unit.sections.map((s, i) => `<h4>${i + 1}. ${s.title}</h4><p class="lesson-text">${s.text}</p>`).join("")}
    </article>
    <h3 class="skill-heading">確認テスト（全${unit.quiz.length}問・${unit.quiz.length * POINTS_PER_QUESTION}点満点）</h3>
    <form class="quiz" data-quiz>
      ${unit.quiz.map((item, i) => `
        <fieldset class="quiz-item" data-quiz-item="${i}">
          <legend>問${i + 1}　${item.q}</legend>
          ${item.options.map((o, j) => `<label class="quiz-option"><input type="radio" name="q${i}" value="${j}" required> ${o}</label>`).join("")}
          <p class="quiz-feedback" data-feedback hidden></p>
        </fieldset>`).join("")}
      <div class="phase-controls">
        <button type="submit" class="btn" data-grade>採点する</button>
        <button type="button" class="btn btn--ghost" data-retry hidden>もう一度解く</button>
        <button type="button" class="btn" data-save-score hidden>この得点を記録する</button>
      </div>
      <p class="status" data-quiz-status role="status"></p>
    </form>`;
}

function setupQuiz(box, unit, domain) {
  const form = box.querySelector("[data-quiz]");
  const status = box.querySelector("[data-quiz-status]");
  const gradeBtn = box.querySelector("[data-grade]");
  const retryBtn = box.querySelector("[data-retry]");
  const saveBtn = box.querySelector("[data-save-score]");
  let score = null;
  let correct = 0;

  const setStatus = (msg, isError = false) => {
    status.textContent = msg;
    status.classList.toggle("status--error", isError);
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    correct = 0;
    unit.quiz.forEach((item, i) => {
      const fieldset = form.querySelector(`[data-quiz-item="${i}"]`);
      const ok = Number(form[`q${i}`].value) === item.answer;
      if (ok) correct++;
      fieldset.classList.toggle("is-correct", ok);
      fieldset.classList.toggle("is-wrong", !ok);
      const feedback = fieldset.querySelector("[data-feedback]");
      feedback.hidden = false;
      feedback.textContent = `${ok ? "○ 正解" : `× 不正解（正解：${item.options[item.answer]}）`}　${item.explain}`;
      fieldset.querySelectorAll("input").forEach((input) => (input.disabled = true));
    });
    score = correct * POINTS_PER_QUESTION;
    gradeBtn.hidden = true;
    retryBtn.hidden = false;
    saveBtn.hidden = false;
    setStatus(`${unit.quiz.length}問中 ${correct}問正解：${score}点。間違えた問題の解説を読んでから、記録しましょう。`);
  });

  retryBtn.addEventListener("click", () => {
    form.reset();
    form.querySelectorAll("[data-quiz-item]").forEach((f) => {
      f.classList.remove("is-correct", "is-wrong");
      f.querySelector("[data-feedback]").hidden = true;
      f.querySelectorAll("input").forEach((input) => (input.disabled = false));
    });
    score = null;
    gradeBtn.hidden = false;
    retryBtn.hidden = true;
    saveBtn.hidden = true;
    setStatus("");
  });

  saveBtn.addEventListener("click", async () => {
    if (score === null) return;
    if (!isConnected()) return setStatus("記録を保存するには「設定」でスプレッドシートと接続してください。", true);
    saveBtn.disabled = true;
    setStatus("保存中…");
    try {
      await api.addRecord({
        domain: domain.id, metric: unit.key, date: today(), value: score, unit: "点",
        memo: `確認テスト（${unit.quiz.length}問中${correct}問正解）`,
      });
      saveBtn.hidden = true;
      setStatus(`${score}点を記録しました。下の「記録とふり返り」で推移を確認できます。`);
      document.dispatchEvent(new CustomEvent("pe:records-changed", { detail: { domain: domain.id, metric: unit.key, source: "quiz" } }));
    } catch (err) {
      setStatus(err.message, true);
    } finally {
      saveBtn.disabled = false;
    }
  });
}

export function render(container, domain) {
  container.innerHTML = `
    <section class="panel">
      <h2>単元の解説と確認テスト</h2>
      <div class="metric-tabs" role="tablist">
        ${UNITS.map((u, i) => `<button role="tab" data-unit-tab="${i}" aria-selected="${i === 0}">単元${i + 1}</button>`).join("")}
      </div>
      <div data-unit-panel></div>
    </section>`;

  const box = container.querySelector("[data-unit-panel]");
  const show = (unit) => {
    box.innerHTML = unitPanel(unit);
    setupQuiz(box, unit, domain);
  };

  container.querySelectorAll("[data-unit-tab]").forEach((tab) => {
    tab.addEventListener("click", () => {
      container.querySelectorAll("[data-unit-tab]").forEach((t) => t.setAttribute("aria-selected", t === tab));
      show(UNITS[tab.dataset.unitTab]);
    });
  });

  show(UNITS[0]);
}
