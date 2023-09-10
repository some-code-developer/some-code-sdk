const fs = require("fs");
const path = require("path");
const reader = require("xlsx");

//NOTE: cleanPath function prevents access to the files or folders outside files directory
const { cleanPath } = require("./utils");

actionParameters.ExecutionResult = SUCCESS;
try {
  const fileName = cleanPath(actionParameters.file);
  const ws = reader.readFile(fileName);
  actionParameters.data = reader.utils.sheet_to_json(ws.Sheets[actionParameters.sheet]);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;
