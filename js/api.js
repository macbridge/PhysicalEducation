// GAS Webアプリとの通信モジュール
// 接続設定（WebアプリURL・合言葉）は生徒のブラウザの localStorage にのみ保存する
// { demo: true } の場合は GAS を使わず、この端末内だけで動くデモモードになる
const STORAGE_KEY = "pe-platform:connection";
const DEMO_KEY = "pe-platform:demo-records";

export function loadConnection() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null;
  } catch {
    return null;
  }
}

export function saveConnection({ url, token }) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ url: url.trim(), token: token.trim() }));
}

export function startDemo() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ demo: true }));
}

export function clearConnection() {
  localStorage.removeItem(STORAGE_KEY);
}

export const isConnected = () => Boolean(loadConnection()?.url || loadConnection()?.demo);
export const isDemo = () => Boolean(loadConnection()?.demo);

function requireConnection() {
  const conn = loadConnection();
  if (!conn?.url) throw new Error("GASの接続設定がありません。「設定」画面で登録してください。");
  return conn;
}

async function request(url, init) {
  let res;
  try {
    res = await fetch(url, init);
  } catch {
    throw new Error("GASに接続できません。URLが正しいか、ネットワークにつながっているか確認してください。");
  }
  if (!res.ok) throw new Error(`通信エラー (HTTP ${res.status})`);
  let json;
  try {
    json = await res.json();
  } catch {
    // 「アクセスできるユーザー」が全員になっていないと、JSONではなくログイン画面のHTMLが返る
    throw new Error("GASから正しい応答がありません。デプロイ時の「アクセスできるユーザー」が「全員」になっているか確認してください。");
  }
  if (!json.ok) throw new Error(json.error || "不明なエラー");
  return json.data;
}

// 読み込み系：GET（クエリパラメータ）
function get(action, params = {}) {
  const { url, token } = requireConnection();
  const query = new URLSearchParams({ action, token, ...params });
  return request(`${url}?${query}`);
}

// 書き込み系：POST。text/plain にしてCORSプリフライトを回避する
function post(action, payload = {}) {
  const { url, token } = requireConnection();
  return request(url, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify({ action, token, payload }),
  });
}

// ---- デモモード（gas_backend.gs と同じ形のデータを localStorage に保存） ----
const demoStore = {
  read: () => {
    try {
      return JSON.parse(localStorage.getItem(DEMO_KEY)) || [];
    } catch {
      return [];
    }
  },
  write: (records) => localStorage.setItem(DEMO_KEY, JSON.stringify(records)),
};

const demoApi = {
  ping: async () => ({ spreadsheet: "デモモード（この端末のみ）", time: new Date().toISOString() }),
  getRecords: async (domain, metric) =>
    demoStore.read().filter((r) => (!domain || r.domain === domain) && (!metric || r.metric === metric)),
  addRecord: async (p) => {
    const record = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...p };
    demoStore.write([...demoStore.read(), record]);
    return record;
  },
  deleteRecord: async (id) => {
    demoStore.write(demoStore.read().filter((r) => r.id !== id));
    return { id };
  },
  getProfile: async () => ({}),
  saveProfile: async (profile) => profile,
};

const gasApi = {
  ping: () => get("ping"),
  // 未指定の引数は送らない（URLSearchParams は undefined を文字列 "undefined" にしてしまうため）
  getRecords: (domain, metric) => get("getRecords", { ...(domain && { domain }), ...(metric && { metric }) }),
  addRecord: (record) => post("addRecord", record),
  deleteRecord: (id) => post("deleteRecord", { id }),
  getProfile: () => get("getProfile"),
  saveProfile: (profile) => post("saveProfile", profile),
};

// 呼び出し時点の接続設定に応じて振り分ける
export const api = Object.fromEntries(
  Object.keys(gasApi).map((name) => [name, (...args) => (isDemo() ? demoApi : gasApi)[name](...args)])
);
