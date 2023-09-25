// Documentation
// https://github.com/exceljs/exceljs#interface

const ExcelJS = require('exceljs');

//NOTE: cleanPath function prevents access to the files or folders outside files directory
const { cleanPath } = require('./utils');

actionParameters.ExecutionResult = SUCCESS;
try {
  const fileName = cleanPath(actionParameters.file);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(fileName);
  const worksheet = workbook.getWorksheet(actionParameters.sheet);
  if (!worksheet) throw new Error(`Sheet: "${actionParameters.sheet}" not found`);
  let rows;
  if (typeof actionParameters.data === 'string') rows = JSON.parse(actionParameters.data);
  else rows = actionParameters.data;
  // Assigning data one cell at the time
  for (let i = 0; i < rows.length; i++) {
    let row = worksheet.getRow(i + 1);
    for (let j = 0; j < rows[i].length; j++) row.getCell(j + 1).value = rows[i][j];
    row.commit();
  }

  await workbook.xlsx.writeFile(fileName);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;
