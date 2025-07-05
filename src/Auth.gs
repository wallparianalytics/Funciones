/**
 * Funciones de autenticación y registro de acceso.
 */

/**
 * Valida las credenciales de un usuario y registra el intento.
 * @param {{email:string,dni:string}} form
 * @return {Object}
 */
function login(form) {
  const email = Utilities.formatString('%s', form.email).trim();
  const dni = Utilities.formatString('%s', form.dni).trim();
  const ss = getSpreadsheet(ROLES_SS_ID);
  const sheet = ss.getSheetByName(ROLES_SHEET);
  const data = sheet.getDataRange().getValues();
  const headers = data.shift();
  const idxEmail = headers.indexOf('CORREO');
  const idxDni = headers.indexOf('DNI');
  let result = null;
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    if (row[idxEmail] === email && String(row[idxDni]) === dni) {
      result = row;
      break;
    }
  }
  const logSheet = ss.getSheetByName(LOGS_SHEET);
  const ts = new Date();
  if (!result) {
    logSheet.appendRow([ts, email, dni, 'FALLO']);
    return {success: false};
  }
  logSheet.appendRow([ts, email, dni, 'EXITO']);
  return {
    success: true,
    role: result[headers.indexOf('Rol')],
    idMonitor: result[headers.indexOf('ID_Monitor')],
    fullName: result[headers.indexOf('APELLIDOS Y NOMBRES')]
  };
}

globalThis.login = login;
