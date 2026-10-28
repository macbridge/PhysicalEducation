// GAS Webアプリとの通信モジュール
// 接続設定（WebアプリURL・合言葉）は生徒のブラウザの localStorage にのみ保存する
const STORAGE_KEY = "pe-platform:connection";

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

export function clearConnection() {
  localStorage.removeItem(STORAGE_KEY);
}

export const isConnected = () => Boolean(loadConnection()?.url);

function requireConnection() {
  const conn = loadConnection();
  if (!conn?.url) throw new Error("GASの接続設定がありません。「設定」画面で登録してください。");
  return conn;
}

async function parse(res) {
  if (!res.ok) throw new Error(`通信エラー (HTTP ${res.status})`);
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "不明なエラー");
  return json.data;
}

// 読み込み系：GET（クエリパラメータ）
async function get(action, params = {}) {
  const { url, token } = requireConnection();
  const query = new URLSearchParams({ action, token, ...params });
  return parse(await fetch(`${url}?${query}`));
}

// 書き込み系：POST。text/plain にしてCORSプリフライトを回避する
async function post(action, payload = {}) {
  const { url, token } = requireConnection();
  return parse(
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ action, token, payload }),
    })
  );
}

export const api = {
  ping: () => get("ping"),
  getRecords: (domain, metric) => get("getRecords", { domain, ...(metric && { metric }) }),
  addRecord: (record) => post("addRecord", record),
  deleteRecord: (id) => post("deleteRecord", { id }),
  getProfile: () => get("getProfile"),
  saveProfile: (profile) => post("saveProfile", profile),
};
