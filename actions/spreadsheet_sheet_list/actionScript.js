const fs = require("fs");
const path = require("path");
const reader = require("xlsx");

//NOTE: cleanPath function prevents access to the files or folders outside files directory
const { cleanPath } = require("./utils");

actionParameters.ExecutionResult = SUCCESS;
const files = [];
try {
  const fileName = cleanPath(actionParameters.file);
  const file = reader.readFile(fileName);
  actionParameters.sheets = file.SheetNames;
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;
