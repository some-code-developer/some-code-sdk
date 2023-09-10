const fs = require("fs");
actionParameters.ExecutionResult = SUCCESS;

//NOTE: cleanPath function prevents access to the files or folders outside files directory
const { cleanPath } = require("./utils");

try {
  const source = cleanPath(actionParameters.source);
  const target = cleanPath(actionParameters.target);
  fs.renameSync(source, target);
} catch (e) {
  actionParameters.ExecutionResult = ERROR;
  stepExecutionInfo.message = e.message;
  logger.error(e.message);
}
return actionParameters.ExecutionResult;
