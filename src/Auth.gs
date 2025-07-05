/**
 * Funciones de autenticación y registro de acceso.
 */

/**
 * Valida las credenciales de un usuario y registra el intento.
 * @param {{email:string,dni:string}} form
 * @return {Object}
 */
function login(form) {
  const ss = getSpreadsheet(ROLES_SS_ID);
  const sheet = ss.getSheetByName(ROLES_SHEET);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const idxEmail = headers.indexOf('CORREO');
  const idxDni = headers.indexOf('DNI');
  let result = null;
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (row[idxEmail] === form.email && String(row[idxDni]) === form.dni) {
      result = row;
      break;
    }
  }
  const logSheet = ss.getSheetByName(LOGS_SHEET);
  const ts = new Date();
  if (!result) {
    logSheet.appendRow([ts, form.email, form.dni, 'FALLO']);
    return {success: false};
  }
  logSheet.appendRow([ts, form.email, form.dni, 'EXITO']);
  return {
    success: true,
    role: result[headers.indexOf('Rol')],
    idMonitor: result[headers.indexOf('ID_Monitor')],
    fullName: result[headers.indexOf('APELLIDOS Y NOMBRES')]
  };
}

globalThis.login = login;
