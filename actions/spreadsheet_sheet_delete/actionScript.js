const fs = require("fs");
const path = require("path");
const reader = require("xlsx");

//NOTE: cleanPath function prevents access to the files or folders outside files directory
const { cleanPath } = require("./utils");

function delete_ws(wb, wsname) {
  const sidx = wb.SheetNames.indexOf(wsname);
  if (sidx == -1) throw `cannot find ${wsname} in workbook`;

  // remove from workbook
  wb.SheetNames.splice(sidx, 1);
  delete wb.Sheets[wsname];

  // update other structures
  if (wb.Workbook) {
    if (wb.Workbook.Views) wb.Workbook.Views.splice(sidx, 1);
    if (wb.Workbook.Names) {
      const names = wb.Workbook.Names;
      for (let j = names.length - 1; j >= 0; --j) {
        if (names[j].Sheet == sidx) names = names.splice(j, 1);
        else if (names[j].Sheet > sidx) --names[j].Sheet;
      }
    }
  }
}

actionParameters.ExecutionResult = SUCCESS;
const files = [];
try {
  const fileName = cleanPath(actionParameters.file);
  const wb = reader.readFile(fileName);
  delete_ws(wb, actionParameters.sheet);
  reader.writeFile(wb, fileName);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;
