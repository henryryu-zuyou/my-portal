// 綁在「AI資料庫」試算表上的 Apps Script Web App（doPost）。
// 表單送出（/api/submit）與屋主問答無答案紀錄（/api/ask-log）都打這支，
// 由 payload 的 type 決定寫進哪個分頁。改 Apps Script 後記得「建立新版本」重新部署，否則線上還是舊的。
export const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyzMV8HXFndjRJVZvSIkcNqKfIWsbqY603oWZEU_VbLg7f-FEDd02zrFSt9vKJmjzQ2/exec";
