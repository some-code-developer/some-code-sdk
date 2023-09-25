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
  worksheet.activeTab;
  if (!worksheet) throw new Error(`Sheet: "${actionParameters.sheet}" not found`);

  logger.error(JSON.stringify(workbook.views));

  workbook.views = [
    {
      x: 0,
      y: 0,
      width: 10000,
      height: 20000,
      firstSheet: 0,
      activeTab: worksheet.id - 1,
      visibility: 'visible',
    },
  ];
  await workbook.xlsx.writeFile(fileName);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;
