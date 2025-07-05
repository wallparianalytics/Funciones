/**
 * Router principal y utilidades de la WebApp
 */

const CACHE = {};

/**
 * Obtiene y cachea un Spreadsheet por ID.
 * @param {string} id
 * @return {SpreadsheetApp.Spreadsheet}
 */
function getSpreadsheet(id) {
  if (!CACHE[id]) {
    CACHE[id] = SpreadsheetApp.openById(id);
  }
  return CACHE[id];
}

/**
 * Incluye archivos HTML en plantillas
 * @param {string} name
 * @return {string}
 */
function include(name) {
  return HtmlService.createHtmlOutputFromFile(name).getContent();
}

/**
 * Muestra la página de login
 * @return {HtmlOutput}
 */
function doGet() {
  return showLogin();
}

/**
 * Retorna la plantilla de login
 * @return {HtmlOutput}
 */
function showLogin() {
  const t = HtmlService.createTemplateFromFile('index');
  return t.evaluate().setTitle('WebApp');
}

/** Menú para recargar la app (solo desarrollo) */
function onOpen(e){
  SpreadsheetApp.getUi().createMenu('WebApp')
    .addItem('Recargar\xA0App', 'showLogin')
    .addToUi();
}

globalThis.include = include;
globalThis.getSpreadsheet = getSpreadsheet;
globalThis.showLogin = showLogin;
/**
 * Retorna la interfaz principal con parámetros
 * @param {string} role
 * @param {string} idMonitor
 * @param {string} fullName
 * @return {HtmlOutput}
 */
function showMain(role, idMonitor, fullName) {
  const t = HtmlService.createTemplateFromFile('main');
  t.role = role;
  t.idMonitor = idMonitor;
  t.fullName = fullName;
  return t.evaluate().setTitle('WebApp');
}
globalThis.showMain = showMain;
