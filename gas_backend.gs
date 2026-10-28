/**
 * 体育ラーニング — GAS バックエンド（スプレッドシート連携API）
 *
 * 【設置手順】
 * 1. 自分の Google スプレッドシートを開き「拡張機能 > Apps Script」を開く
 * 2. このファイルの内容をすべて貼り付けて保存
 * 3. 関数 setup を選んで「実行」→ 権限を承認（Records / Profile シートが作成される）
 * 4. 「プロジェクトの設定 > スクリプト プロパティ」で
 *      プロパティ: TOKEN   値: 自分で決めた合言葉
 *    を追加する
 * 5. 「デプロイ > 新しいデプロイ > ウェブアプリ」
 *      次のユーザーとして実行: 自分 / アクセスできるユーザー: 全員
 *    でデプロイし、表示された「ウェブアプリURL」をサイトの設定画面に入力する
 *
 * 【CORSについて】
 * GAS はレスポンスヘッダーを設定できないが、ContentService の応答は
 * googleusercontent.com 経由で Access-Control-Allow-Origin: * 付きで返る。
 * フロント側は POST を Content-Type: text/plain で送り、プリフライトを発生させないこと。
 */

const SHEETS = {
  records: { name: 'Records', headers: ['id', 'createdAt', 'domain', 'metric', 'date', 'value', 'unit', 'memo'] },
  profile: { name: 'Profile', headers: ['key', 'value'] },
};

/** 初回のみ手動実行：シートとヘッダー行を作成する */
function setup() {
  Object.values(SHEETS).forEach(getSheet_);
}

function doGet(e) {
  return handle_(() => {
    const p = e.parameter || {};
    authorize_(p.token);
    switch (p.action) {
      case 'ping':
        return { spreadsheet: SpreadsheetApp.getActive().getName(), time: new Date().toISOString() };
      case 'getRecords':
        return getRecords_(p.domain, p.metric);
      case 'getProfile':
        return getProfile_();
      default:
        throw new Error('不明なアクションです: ' + p.action);
    }
  });
}

function doPost(e) {
  return handle_(() => {
    const body = JSON.parse((e.postData && e.postData.contents) || '{}');
    authorize_(body.token);
    const payload = body.payload || {};
    switch (body.action) {
      case 'addRecord':
        return addRecord_(payload);
      case 'deleteRecord':
        return deleteRecord_(payload.id);
      case 'saveProfile':
        return saveProfile_(payload);
      default:
        throw new Error('不明なアクションです: ' + body.action);
    }
  });
}

// ---- 共通処理 ----

function handle_(fn) {
  let result;
  try {
    result = { ok: true, data: fn() };
  } catch (err) {
    result = { ok: false, error: err.message };
  }
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function authorize_(token) {
  const expected = PropertiesService.getScriptProperties().getProperty('TOKEN');
  if (!expected) throw new Error('スクリプトプロパティ TOKEN が設定されていません');
  if (token !== expected) throw new Error('合言葉が正しくありません');
}

function getSheet_(def) {
  const ss = SpreadsheetApp.getActive();
  let sheet = ss.getSheetByName(def.name);
  if (!sheet) {
    sheet = ss.insertSheet(def.name);
    sheet.appendRow(def.headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function readRows_(def) {
  const values = getSheet_(def).getDataRange().getValues();
  const headers = values.shift();
  return values.map((row) => Object.fromEntries(headers.map((h, i) => [h, row[i]])));
}

function formatDate_(v) {
  // シートが日付として自動変換した値は、シートのタイムゾーンで yyyy-MM-dd に戻す
  return v instanceof Date
    ? Utilities.formatDate(v, SpreadsheetApp.getActive().getSpreadsheetTimeZone(), 'yyyy-MM-dd')
    : String(v);
}

// ---- 記録 ----

function getRecords_(domain, metric) {
  return readRows_(SHEETS.records)
    .filter((r) => (!domain || r.domain === domain) && (!metric || r.metric === metric))
    .map((r) => ({ ...r, date: formatDate_(r.date), value: Number(r.value) }));
}

function addRecord_(p) {
  if (!p.domain || !p.metric || !p.date) throw new Error('domain / metric / date は必須です');
  const value = Number(p.value);
  if (!isFinite(value)) throw new Error('記録は数値で入力してください');

  const record = {
    id: Utilities.getUuid(),
    createdAt: new Date().toISOString(),
    domain: String(p.domain),
    metric: String(p.metric),
    date: String(p.date),
    value: value,
    unit: String(p.unit || ''),
    memo: String(p.memo || '').slice(0, 200),
  };
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    getSheet_(SHEETS.records).appendRow(SHEETS.records.headers.map((h) => record[h]));
  } finally {
    lock.releaseLock();
  }
  return record;
}

function deleteRecord_(id) {
  const sheet = getSheet_(SHEETS.records);
  const ids = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 1).getValues().flat();
  const index = ids.indexOf(id);
  if (index === -1) throw new Error('記録が見つかりません');
  sheet.deleteRow(index + 2);
  return { id: id };
}

// ---- プロフィール（学年・クラスなど key-value で保存） ----

function getProfile_() {
  return Object.fromEntries(readRows_(SHEETS.profile).map((r) => [r.key, r.value]));
}

function saveProfile_(profile) {
  const sheet = getSheet_(SHEETS.profile);
  const current = Object.assign(getProfile_(), profile);
  sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 2).clearContent();
  const rows = Object.entries(current);
  if (rows.length) sheet.getRange(2, 1, rows.length, 2).setValues(rows);
  return current;
}
