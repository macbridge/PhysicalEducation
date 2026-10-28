// 領域定義（学習指導要領 高等学校 科目「体育」A〜H）
// metrics: 記録項目。better は "lower"（小さいほど良い：タイム）/ "higher"（大きいほど良い：距離・得点）
export const DOMAINS = [
  {
    id: "A", slug: "a-taitsukuri", name: "体つくり運動", color: "#e8590c",
    summary: "体ほぐしの運動と実生活に生かす運動の計画を通して、自他の心と体に向き合い、健康や体力の向上を図る。",
    contents: ["体ほぐしの運動", "実生活に生かす運動の計画"],
    // 新体力テスト（12〜19歳）の8項目＋運動の実施記録。得点化は js/fitness.js
    metrics: [
      { key: "grip", label: "握力", unit: "kg", better: "higher" },
      { key: "situp", label: "上体起こし", unit: "回", better: "higher" },
      { key: "sitreach", label: "長座体前屈", unit: "cm", better: "higher" },
      { key: "sidestep", label: "反復横とび", unit: "点", better: "higher" },
      { key: "endurance", label: "持久走", unit: "秒", better: "lower", format: "time" },
      { key: "shuttle", label: "20mシャトルラン", unit: "回", better: "higher" },
      { key: "dash50", label: "50m走", unit: "秒", better: "lower" },
      { key: "standjump", label: "立ち幅とび", unit: "cm", better: "higher" },
      { key: "handball", label: "ハンドボール投げ", unit: "m", better: "higher" },
      { key: "exercise", label: "運動の実施時間", unit: "分", better: "higher" },
    ],
    content: true,
  },
  {
    id: "B", slug: "b-kikai", name: "器械運動", color: "#7048e8",
    summary: "技がよりよくできる楽しさや喜びを味わい、自己に適した技で演技することを目指す。",
    contents: ["マット運動", "鉄棒運動", "平均台運動", "跳び箱運動"],
    metrics: [], // 技の習得チェックは js/content/b-kikai.js（Records に技ごとの行を追加）
    content: true,
  },
  {
    id: "C", slug: "c-rikujo", name: "陸上競技", color: "#d6336c",
    summary: "記録の向上や競争の楽しさや喜びを味わい、各種目特有の技能を高める。",
    contents: ["短距離走・リレー", "長距離走", "ハードル走", "走り幅跳び", "走り高跳び", "三段跳び", "砲丸投げ", "やり投げ"],
    metrics: [
      { key: "sprint100", label: "100m走", unit: "秒", better: "lower" },
      { key: "run1500", label: "1500m走", unit: "秒", better: "lower", format: "time" },
      { key: "hurdle", label: "ハードル走", unit: "秒", better: "lower" },
      { key: "longjump", label: "走り幅跳び", unit: "m", better: "higher" },
      { key: "highjump", label: "走り高跳び", unit: "m", better: "higher" },
      { key: "shotput", label: "砲丸投げ", unit: "m", better: "higher" },
    ],
    content: true, // js/content/c-rikujo.js に領域固有の学習コンテンツあり
  },
  {
    id: "D", slug: "d-suiei", name: "水泳", color: "#1c7ed6",
    summary: "記録の向上や競争の楽しさや喜びを味わい、効率的に泳ぐことができるようにする。",
    contents: ["クロール", "平泳ぎ", "背泳ぎ", "バタフライ", "複数の泳法で長く泳ぐ・リレー"],
    metrics: [
      { key: "free50", label: "クロール50m", unit: "秒", better: "lower" },
      { key: "breast50", label: "平泳ぎ50m", unit: "秒", better: "lower" },
      { key: "back50", label: "背泳ぎ50m", unit: "秒", better: "lower" },
      { key: "fly25", label: "バタフライ25m", unit: "秒", better: "lower" },
      { key: "distance", label: "長く泳ぐ（距離）", unit: "m", better: "higher" },
    ],
    content: true,
  },
  {
    id: "E", slug: "e-kyugi", name: "球技", color: "#2f9e44",
    summary: "勝敗を競う楽しさや喜びを味わい、作戦や状況に応じた技能で仲間と連携しゲームを展開する。",
    contents: ["ゴール型（バスケットボール・ハンドボール・サッカー・ラグビー）", "ネット型（バレーボール・卓球・テニス・バドミントン）", "ベースボール型（ソフトボール）"],
    metrics: [], // 種目別の個人スタッツ・自己評価は js/content/e-kyugi.js
    content: true,
  },
  {
    id: "F", slug: "f-budo", name: "武道", color: "#3b5bdb",
    summary: "技を高め勝敗を競う楽しさや喜びを味わい、伝統的な考え方を理解し、相手を尊重する。",
    contents: ["柔道", "剣道"],
    metrics: [], // 技の習得チェックは js/content/f-budo.js
    content: true,
  },
  {
    id: "G", slug: "g-dance", name: "ダンス", color: "#f08c00",
    summary: "感じを込めて踊ったり仲間と自由に踊ったりする楽しさや喜びを味わい、交流や発表ができるようにする。",
    contents: ["創作ダンス", "フォークダンス", "現代的なリズムのダンス"],
    metrics: [], // 自己評価・相互評価は js/content/g-dance.js
    content: true,
  },
  {
    id: "H", slug: "h-riron", name: "体育理論", color: "#0c8599",
    summary: "スポーツの文化的特性や現代のスポーツの発展、効果的な学習の仕方、豊かなスポーツライフの設計について理解する。",
    contents: ["スポーツの文化的特性や現代のスポーツの発展", "運動やスポーツの効果的な学習の仕方", "豊かなスポーツライフの設計の仕方"],
    // 単元ごとの確認テストの得点（js/content/h-riron.js のテストから保存。紙のテストの点を手入力してもよい）
    metrics: [
      { key: "unit1", label: "単元1 文化的特性・発展", unit: "点", better: "higher" },
      { key: "unit2", label: "単元2 効果的な学習の仕方", unit: "点", better: "higher" },
      { key: "unit3", label: "単元3 スポーツライフの設計", unit: "点", better: "higher" },
    ],
    content: true,
  },
];

export const findDomain = (id) => DOMAINS.find((d) => d.id === id);
