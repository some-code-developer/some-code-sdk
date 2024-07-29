const fs = require("fs");

//NOTE: cleanPath function prevents access to the files or folders outside files directory
const { cleanPath } = require("./utils");

actionParameters.ExecutionResult = SUCCESS;
try {
  const folder = cleanPath(actionParameters.folder);
  if (fs.existsSync(folder)) actionParameters.ExecutionResult = SUCCESS;
  else throw new Error(`Folder: ${folder} does not exists`);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  actionParameters.ExecutionMessage = e.message;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
  logger.error(e.stack.replace(e.message, ""));
}
return actionParameters.ExecutionResult;
