/**
 * Controlador para operaciones de llamadas
 */

/**
 * Obtiene casos asignados a un monitor.
 * @param {string} idMonitor
 * @return {Object[]}
 */
function getCases(idMonitor) {
  const ss = getSpreadsheet(CALLS_SS_ID);
  const sheet = ss.getSheetByName(CALLS_SHEET);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const idxIdMonitor = headers.indexOf('ID_Monitor');
  const results = [];
  data.forEach(row => {
    if (String(row[idxIdMonitor]) === idMonitor) {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      results.push(obj);
    }
  });
  return results;
}

/**
 * Registra una llamada para un caso específico.
 * @param {Object} callData
 */
function saveCall(callData) {
  const lock = LockService.tryLock(30000);
  if (!lock) return {error: 'LOCK'};
  try {
    const ss = getSpreadsheet(CALLS_SS_ID);
    const sheet = ss.getSheetByName(CALLS_SHEET);
    const range = sheet.getDataRange();
    const values = range.getValues();
    const headers = values.shift();
    const idxDni = headers.indexOf('dni');
    let rowIndex = -1;
    for (let i = 0; i < values.length; i++) {
      if (String(values[i][idxDni]) === callData.dni) {
        rowIndex = i + 2; // +2 por encabezado y base 1
        break;
      }
    }
    if (rowIndex === -1) return {error: 'NOT_FOUND'};
    const now = new Date();
    sheet.getRange(rowIndex, headers.length + 1, 1, 4).setValues([[now, callData.estado, callData.participa, callData.obs]]);
    return {success: true};
  } finally {
    lock.releaseLock();
  }
}

globalThis.getCases = getCases;
globalThis.saveCall = saveCall;
