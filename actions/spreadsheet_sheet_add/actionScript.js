// Documentation
// https://github.com/exceljs/exceljs#interface

const ExcelJS = require('exceljs');

//NOTE: cleanPath function prevents access to the files or folders outside files directory
const { cleanPath } = require('./utils');

actionParameters.ExecutionResult = SUCCESS;
const files = [];
try {
  const fileName = cleanPath(actionParameters.file);
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(fileName);
  workbook.addWorksheet(actionParameters.sheet);
  await workbook.xlsx.writeFile(fileName);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  actionParameters.ExecutionMessage = e.message;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
  logger.error(e.stack.replace(e.message, ""));
}
return actionParameters.ExecutionResult;
